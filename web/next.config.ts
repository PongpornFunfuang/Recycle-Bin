import type { NextConfig } from "next";

const config: NextConfig = {
  distDir: ".next",
  poweredByHeader: false,
  devIndicators: false,
  logging: { incomingRequests: { ignore: [/\/auth\/callback(?:\?|$)/] } },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "same-origin" },
        { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(self)" },
        { key: "X-Frame-Options", value: "DENY" }
      ]
    }];
  }
};
export default config;
