# Environment and compatibility

Never paste credentials into chat, docs, screenshots, backup or source control. Current `.env.local` is connected to approved project fdmohzvuxvsrcaddbjvl using its URL/Publishable key and server-only Secret/HMAC. Real owner/Auth/Data API/scan persistence tests passed; owner subsequently became the approved First Admin. Values are not reproduced here. The original private database-password copy is empty/unusable: direct PostgreSQL access/backup is not established. Blank examples live in `web/.env.example` and `ai-service/.env.example`.

| Variable | Location | Purpose |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | web/.env.local | HTTPS `*.supabase.co` project URL |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | web/.env.local | `sb_publishable_` public key, enforced by config validator |
| RB_EXPECT_DATABASE | web server environment | `production` (default) pins to `fdmohzvuxvsrcaddbjvl`; `test` is accepted only with the dedicated Test reference below |
| RB_TEST_PROJECT_REF | Test web process and Vercel Preview | Must be `yyprbgvhmncddlyeduyr`; the URL must match exactly, Preview must explicitly use Test mode, and Production Vercel deployments reject Test mode |
| SUPABASE_SECRET_KEY | web/.env.local, server only | `sb_secret_` key for verified-scan writer only; bypasses RLS inherently |
| SCAN_RECEIPT_SECRET | web/.env.local, server only | Random >=32 characters for HMAC; never NEXT_PUBLIC |
| AI_SERVICE_URL | web/.env.local, optional | Defaults to http://127.0.0.1:8000; remote AI requires HTTPS and an exact tunnel hostname allowlist |
| AI_TUNNEL_HOST | web server environment only | Exact public hostname matching the HTTPS AI_SERVICE_URL; blocks unexpected upstream destinations |
| CLOUDFLARE_ACCESS_CLIENT_ID / CLOUDFLARE_ACCESS_CLIENT_SECRET | web server environment only | Cloudflare Access service-token headers for the remote AI request; never NEXT_PUBLIC |
| AI_INTERNAL_TOKEN | process environment of both servers, optional | Shared internal AI token; sent only by the Next.js server proxy |
| MODEL_PATH | AI environment, optional | Default existing local Faster R-CNN weights |
| MAX_IMAGE_BYTES | AI environment | Default 8388608 |

Next.js loads `.env.local`. Uvicorn does not automatically load `ai-service/.env.example` or an arbitrary `.env`; use process-scoped environment values in the terminal before starting when overriding defaults. Restart Next after changing database configuration; NEXT_PUBLIC variables are build-time client-visible values. Rebuild if using a production build. Do not rename secrets to NEXT_PUBLIC to resolve a configuration error.

The local Test launcher reads only `.local/secrets/supabase-test-yyprbgvhmncddlyeduyr.json`, verifies the project reference and key formats, and sets all Supabase URL/key variables plus `RB_EXPECT_DATABASE=test` before starting Next. Next may report `.env.local` as a discovered file, but inherited Test variables take precedence; the configuration guard fails closed unless the complete Test mode and exact Test project URL agree. The default mode is Production and accepts only `https://fdmohzvuxvsrcaddbjvl.supabase.co`. Test fixtures and keys must never be copied into `.env.local` or Production hosting settings.

The opaque `sb_secret_` value does not reveal its Supabase project ID locally. The application always sends it to the same validated URL as the publishable key; successful server-side Test/Production operations establish acceptance by that project, but the key's project association cannot be independently read without a request to Supabase. Vercel environment values were not verified in this local checkout and must be treated as UNKNOWN until inspected in the Vercel dashboard.

Installed foundation: Next16.4.3, React19.3.1, TypeScript7.0.2, Tailwind4.3.3, SupabaseJS2.118.0, SSR0.12.7, Zod4.6.7. Python3.12.14, FastAPI0.162.0, torch2.14.1+cu126, torchvision0.29.1+cu126. Exact installed inventory and lockfiles are evidence; a fresh resolution is not equivalent. No new package dependency was installed for this redesign; the font asset is Noto Sans Thai under OFL, with source/hash/license in `web/public/fonts`.

The remote AI proxy sends Cloudflare Access service-token headers only from Next.js server routes. Set `AI_TUNNEL_HOST` to the exact public tunnel hostname; the proxy rejects non-HTTPS remote targets, IP literals, credentials, URL paths and host mismatches. Do not expose these values to browser bundles. A Vercel/serverless in-memory rate limit is not a distributed safeguard; production traffic limits must be configured at the hosting/edge layer before public release.

NVIDIA-SMI CUDA13.4 describes the driver's supported CUDA level, not the PyTorch wheel runtime. The installed cu126 wheel passed local CUDA diagnostics and real inference without changing the system toolkit. CPU fallback exists, but CPU/mobile latency has not been certified. RAM15.74GB/VRAM6GB require serial inference, modest frames and avoiding parallel training/build/model loading. The Starlette/httpx test deprecation warning is recorded; it is not silently fixed by a global package change.
