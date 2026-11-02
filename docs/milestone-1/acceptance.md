# M1 acceptance register

All checks initially NOT RUN. Evidence and final status belong in completion-report.md.

| ID | Acceptance |
|---|---|
| M1-AC01 | Protected originals have unchanged SHA-256 |
| M1-AC02 | New files stay in approved structure; no .git/deploy files |
| M1-AC03 | Pinned dependencies / peer compatibility / license inventory |
| M1-AC04 | Project Python venv and package location verified |
| M1-AC05 | Valid/invalid contracts, OpenAPI references and semantics tested |
| M1-AC06 | Node -> dedicated local MongoDB connectivity |
| M1-AC07 | Scratch transaction commit and abort isolation verified |
| M1-AC08 | Actual CUDA discovery and synchronized tensor arithmetic |
| M1-AC09 | Next/FastAPI health and real Node -> Python HTTP contract |
| M1-AC10 | Model readiness stays false, no model files/prediction stubs |
| M1-AC11 | Local-only config, no exposed secrets or production destinations |
| M1-AC12 | Build/typecheck/automated tests and actual evidence recorded |

PASS requires actual evidence. Failure/blockage is reported FAIL/PENDING; none is waived. TC01–TC13 are not being certified; TC04/TC13 remain pending external data/users. M1 completion never authorizes M2 or deployment.
