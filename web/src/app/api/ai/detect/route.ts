import { NextRequest, NextResponse } from "next/server";
import { detectionContract } from "@/lib/detection-contract";
import { aiServiceConfig } from "@/lib/config";
import { sameOrigin, error } from "@/lib/http";
import { receiptSecret, signScan } from "@/lib/scan-receipt";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return error("Origin ไม่ถูกต้อง", 403);
  const client = await supabaseServer();
  if (!client) return error("ระบบบัญชียังไม่ได้เชื่อมต่อ", 503);
  const { data: { user } } = await client.auth.getUser();
  if (!user) return error("กรุณาเข้าสู่ระบบก่อนใช้ AI Scanner", 401);
  const access = await client.rpc("member_access_status");
  if (access.error || access.data !== true) return error("บัญชีไม่พร้อมใช้งาน", 403);
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data;")) return error("ส่งภาพด้วย multipart/form-data เท่านั้น", 415);
  const length = Number(req.headers.get("content-length"));
  if (!Number.isFinite(length) || length <= 0 || length > 9 * 1024 * 1024) return error("ขนาดคำขอไม่ถูกต้องหรือเกิน 9 MB", 413);
  try {
    const data = await req.formData();
    const file = data.get("image");
    if (!(file instanceof File) || file.size === 0 || file.size > 8 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return error("รองรับ JPEG, PNG, WebP ขนาดไม่เกิน 8 MB", 415);
    const mode = data.get("mode") ?? "photo";
    if (mode !== "photo" && mode !== "live_snapshot") return error("โหมดตรวจจับไม่ถูกต้อง", 422);
    const form = new FormData(); form.append("image", file, "capture"); form.append("mode", mode);
    const service = aiServiceConfig();
    const response = await fetch(`${service.url}/ai/detect`, { method: "POST", body: form, headers: service.headers, signal: AbortSignal.timeout(25000), cache: "no-store" });
    if (!response.ok) {
      if (response.status === 429) return error("AI กำลังประมวลผลภาพอื่น กรุณารอสักครู่", 429);
      if (response.status === 413) return error("ภาพใหญ่เกินขนาดที่ AI รองรับ", 413);
      if (response.status === 415 || response.status === 422) return error("อ่านภาพหรือโหมดตรวจจับไม่ถูกต้อง", response.status);
      return error("AI ไม่พร้อมใช้งานหรือการเชื่อมต่อยังไม่ได้รับอนุญาต", 503);
    }
    const result = detectionContract.safeParse(await response.json());
    if (!result.success) return error("รูปแบบผลจาก AI ไม่ถูกต้อง", 502);
    const headers: Record<string, string> = { "Cache-Control": "no-store" };
    const secret = receiptSecret();
    if (data.get("saveable") === "true" && secret) headers["X-Scan-Receipt"] = signScan(result.data, user.id, secret);
    return NextResponse.json(result.data, { headers });
  } catch {
    return error("ติดต่อ AI ไม่สำเร็จหรือหมดเวลา กรุณาลองอีกครั้ง", 503);
  }
}
