# Installed compatibility — local development

Windows 10 Home 22H2; Node 24.22.1; pnpm 11.25.0; Python 3.12.14 project venv. npm is not on PATH; no global package manager was installed. MongoDB server and Better Auth are not installed or active.

Next 16.4.3, React/React DOM 19.3.1, TypeScript 7.0.2, Tailwind and PostCSS plugin 4.3.3, Supabase JS 2.118.0, SSR 0.12.7, Zod 4.6.7, lucide-react 1.66.0. Supabase JS requires Node >=22; actual Node 24 meets it. SSR requires Supabase JS ^2.114.0; installed 2.118.0 meets it. Next/React/typecheck/build are verified by actual execution. pnpm installs used --ignore-scripts; prebuilt Windows compiler packages loaded successfully.

FastAPI 0.162.0, uvicorn 0.54.0, Pillow 13.0.0, NumPy 2.5.4, ONNX Runtime 1.31.1 (comparison runtime), httpx 0.28.1, pytest 9.2.0. PyTorch 2.14.1+cu126 and torchvision 0.29.1+cu126 match. CUDA wheel runtime 12.6 runs tensor operations and actual inference on RTX 3060 Laptop. Driver/Toolkit not modified. NVIDIA-SMI CUDA 13.4 denotes driver capability, not the wheel runtime.

Primary licenses reviewed from npm/PyPI metadata and official repositories: Next/React/Tailwind/Supabase/Zod/Ajv/ONNX Runtime MIT; TypeScript/PGlite/YOLOX Apache-2.0; lucide ISC; PyTorch/torchvision/uvicorn/httpx BSD-style; Pillow MIT-CMU; NumPy bundled BSD/0BSD/MIT/Zlib/CC0 components. Complete installed metadata is recorded under docs/evidence, and bundled license files remain installed. CUDA wheel third-party licenses apply to included NVIDIA libraries; no public binary redistribution/deployment is performed.

Supabase support follows official Next SSR docs: https://supabase.com/docs/guides/auth/server-side/creating-a-client . Supabase Auth is the only identity system. Hosted connection/SMTP/providers/RLS JWT integration is Pending. Default hosted SMTP restricts authorized recipient addresses and has low rate limits; recovery delivery is not certified. References: https://supabase.com/docs/guides/auth/auth-smtp ; https://supabase.com/docs/guides/database/postgres/row-level-security ; https://github.com/pytorch/vision/blob/main/LICENSE .

pytest emits a Starlette deprecation warning for httpx TestClient usage; tests currently execute successfully. This is recorded, not hidden. No HTTP test library replacement is made solely to silence a warning.

Security follow-up: initial PyTorch 2.11.0+cu128 / pip 25.0.1 / setuptools 78.1.0 advisory results are archived in docs/evidence/runtime-cu128-initial. Upgraded to PyTorch 2.14.1+cu126, torchvision 0.29.1+cu126, pip 26.2.2, setuptools 84.1.0. Official wheel pairing: https://pytorch.org/get-started/previous-versions/ . CUDA 12.6 tensor and full regression tests passed; no driver/toolkit change. Latest PyPI review checked all 40 installed packages and found no known advisories in that source; not a full binary security certification.
