import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase-server";
import { sameOrigin, error, localOrigin } from "@/lib/http";
import { readJson, InputError } from "@/lib/read-json";

const requestSchema = z.object({
  action: z.enum(["login", "register", "logout", "forgot", "reset", "change_password"]),
  email: z.string().optional(), password: z.string().optional(), currentPassword: z.string().optional(), displayName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return error("Origin ไม่ถูกต้อง", 403);
  try {
    const client = await supabaseServer();
    if (!client) return error("ระบบบัญชียังไม่ได้เชื่อมต่อ", 503);
    const body = requestSchema.parse(await readJson(req, 8000));
    if (body.action === "logout") {
      const result = await client.auth.signOut();
      return result.error ? error("ออกจากระบบไม่สำเร็จ", 502) : NextResponse.json({ message: "ออกจากระบบแล้ว" });
    }
    if (body.action === "reset" || body.action === "change_password") {
      const password = z.string().min(10).max(128).parse(body.password);
      const { data: { user } } = await client.auth.getUser();
      if (!user) return error("กรุณาเปิดลิงก์รีเซ็ตที่ยังใช้ได้หรือเข้าสู่ระบบก่อน", 401);
      if (body.action === "change_password") {
        if (!user.email) return error("บัญชีนี้ไม่มีอีเมลสำหรับยืนยันรหัสผ่าน", 400);
        const current = z.string().min(1).max(128).parse(body.currentPassword);
        const proof = await client.auth.signInWithPassword({ email: user.email, password: current });
        if (proof.error || proof.data.user?.id !== user.id) return error("รหัสผ่านปัจจุบันไม่ถูกต้อง", 400);
      }
      const result = await client.auth.updateUser({ password });
      return result.error ? error("เปลี่ยนรหัสผ่านไม่สำเร็จ", 400) : NextResponse.json({ message: "เปลี่ยนรหัสผ่านแล้ว" });
    }
    const email = z.email().max(254).parse(body.email);
    if (body.action === "forgot") {
      const result = await client.auth.resetPasswordForEmail(email, { redirectTo: `${localOrigin(req)}/auth/callback?next=/reset-password` });
      if (result.error) return error("ระบบส่งอีเมลยังไม่พร้อมหรือมีคำขอมากเกินไป กรุณาลองภายหลัง", 502);
      return NextResponse.json({ message: "หากบัญชีนี้ใช้ได้ ระบบจะส่งลิงก์ให้ กรุณาตรวจอีเมล" });
    }
    const password = z.string().min(body.action === "register" ? 10 : 1).max(128).parse(body.password);
    const result = body.action === "login"
      ? await client.auth.signInWithPassword({ email, password })
      : await client.auth.signUp({ email, password, options: { data: { display_name: z.string().trim().min(1).max(80).parse(body.displayName) }, emailRedirectTo: `${localOrigin(req)}/auth/callback` } });
    if (result.error) {
      if (body.action === "login") return error("อีเมล รหัสผ่าน หรือสถานะยืนยันบัญชีไม่ถูกต้อง", 400);
      const code = result.error.code ?? "";
      const authMessage = result.error.message.toLowerCase();
      const message = result.error.status === 0
        ? "เชื่อมต่อ Supabase ไม่ได้ กรุณาตรวจอินเทอร์เน็ตหรือสถานะบริการ แล้วลองใหม่"
        : code === "user_already_exists" || code === "email_exists"
        ? "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบหรือใช้ลืมรหัสผ่าน"
        : code === "email_address_invalid"
          ? "รูปแบบอีเมลไม่ถูกต้อง"
          : code === "signup_disabled"
            ? "ระบบปิดการสมัครสมาชิกชั่วคราว กรุณาติดต่อผู้ดูแล"
            : code === "over_email_send_rate_limit"
              ? "ส่งอีเมลยืนยันถี่เกินไป กรุณารอสักครู่แล้วลองใหม่"
              : code === "redirect_to_not_allowed" || authMessage.includes("redirect")
                ? "การตั้งค่าลิงก์ยืนยันอีเมลยังไม่อนุญาต localhost กรุณาเพิ่ม http://127.0.0.1:3000/auth/callback ใน Supabase Auth URL Configuration"
                : authMessage.includes("email provider")
                  ? "ผู้ให้บริการอีเมลของ Supabase ยังไม่พร้อมใช้งาน"
              : `สมัครไม่สำเร็จ (รหัส ${code || `HTTP ${result.error.status ?? "ไม่ทราบ"}`}) กรุณาตรวจการตั้งค่าการสมัครสมาชิก`;
      return error(message, 400);
    }
    const signedIn = body.action === "register" && Boolean(result.data.session);
    return NextResponse.json({ message: body.action === "login" ? "เข้าสู่ระบบแล้ว" : signedIn ? "สมัครสมาชิกและเข้าสู่ระบบแล้ว" : "รับคำขอสมัครแล้ว กรุณาตรวจอีเมลเพื่อยืนยันตามการตั้งค่า", signedIn });
  } catch (e) {
    return error(e instanceof InputError ? e.message : "ข้อมูลหรือการตั้งค่าไม่ถูกต้อง", e instanceof InputError ? e.status : 400);
  }
}

