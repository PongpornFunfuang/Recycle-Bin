import type { NextConfig } from "next";

// Keep local output isolation out of the Vercel Next.js adapter.
const isVercel = process.env.VERCEL === "1";
const requestedDistDir = process.env.RB_NEXT_DIST_DIR?.trim() || undefined;
if (!isVercel && requestedDistDir && !/^\.next-[a-z0-9-]+$/i.test(requestedDistDir)) {
  throw new Error("RB_NEXT_DIST_DIR must be a local .next-* directory");
}

const config: NextConfig = { distDir: isVercel ? ".next" : requestedDistDir ?? (process.env.RB_TEST_PROJECT_REF ? ".next-test" : ".next"), poweredByHeader: false, devIndicators: false, logging: { incomingRequests: { ignore: [/\/auth\/callback(?:\?|$)/] } }, async headers() { return [{source:"/:path*",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"same-origin"},{key:"Permissions-Policy",value:"camera=(self), microphone=(), geolocation=(self)"},{key:"X-Frame-Options",value:"DENY"}]}]; }};
export default config;
