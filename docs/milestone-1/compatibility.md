# Compatibility decision record — M1-A

Status: registry metadata reviewed; installation/import/build/integration results pending.

## Execution blocker discovered during M1-B

The actual OS is Windows 10 Home Single Language 22H2, build 19045. MongoDB 8.0's official Windows support list includes Windows 11 and Windows Server 2022, not Windows 10. MongoDB 7.0's list also omits Windows 10. A portable ZIP avoids a system installation but does not change platform support.

Official Community ZIP candidate metadata reviewed only: MongoDB 8.0.34, https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.34.zip ; published SHA-256 6b021a0864494e4decf278b36477a29eb36072432773e4e62c2f42c302630db0. NOT downloaded or executed.

Execution stopped before installing application packages or starting M1-C. Project venv was created; only its bootstrapped pip 25.0.1 is present. No MongoDB server, scratch database or GPU tensor test has been run.

User decision required: explicitly allow an unsupported-platform experiment using the project-local ZIP and synthetic scratch data only, or provide/authorize an already available supported Windows 11/Linux host. No OS upgrade, Windows service, firewall, PATH or cloud change is authorized or performed.

Sources: https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-windows/ ; https://www.mongodb.com/docs/v7.0/tutorial/install-mongodb-on-windows/

Existing runtimes: Node 24.22.1 and Python 3.12.14. GPU queried directly: RTX 3060 Laptop, driver 616.92, 6144 MiB. CUDA reported by NVIDIA-SMI describes driver capability, not the PyTorch wheel runtime.

Registry-reviewed candidates: next 16.4.3 MIT (Node >=20.9); react 19.3.1 MIT; better-auth 1.7.15 MIT (Next 16 / React 19 / Mongo driver 7 accepted peers); @better-auth/mongo-adapter 1.7.15 MIT; mongodb 7.8.0 Apache-2.0 (Node >=20.19); tailwindcss 4.3.3 MIT; ajv 8.20.0 MIT. Exact installed versions and transitive licenses will be recorded from real lockfiles/metadata.

Better Auth is compatibility-tested only; no account/auth/recovery business endpoints are built in M1. Its account/session/verification schema is library-owned; no duplicated password hash in profiles.

MongoDB Community is free under SSPL; portable Windows ZIP only, no MSI/service changes. Server version and SHA-256 are recorded after official metadata review.

PyTorch: choose the official Windows/Python 3.12 CUDA wheel, pin the resolved version and test tensor operations without model files. No toolkit/driver changes; torchvision/Ultralytics/ONNX GPU deferred unless needed, no torchaudio.

Sources reviewed 2026-11-01: https://nextjs.org/docs/app/getting-started/installation ; https://better-auth.com/docs/adapters/mongo ; https://www.mongodb.com/legal/licensing/community-edition ; https://pytorch.org/get-started/locally/ ; https://docs.nvidia.com/deploy/nvidia-smi/index.html
