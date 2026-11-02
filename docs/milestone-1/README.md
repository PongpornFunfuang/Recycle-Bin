# Milestone 1 execution scope

Approved: M1-A contracts/documentation, M1-B local environment, M1-C minimal foundation/testing only. M2–M10, deployment, Git changes, model weights, datasets, training, paid services, system-wide installation and OS configuration changes are excluded.

Execution order: baseline -> M1-A review -> M1-B -> M1-C -> real tests -> completion report. Only files created in this milestone may be corrected within scope. Protected originals must remain byte-identical.

Foundation readiness is not AI readiness. The AI service must return 503/model_not_loaded until a separately approved model milestone. No mock prediction route is implemented.

Contracts use JSON Schema 2020-12 and OpenAPI 3.1.0. JSON documents use UTC RFC3339 timestamps and normalized xyxy boxes. Standard schema checks are supplemented by semantic checks for ordered coordinates, matching references, verified bin colors and accepted class labels. References resolve locally, not over the network.

Fixtures, when used, are explicitly synthetic contract examples, never AI results or performance evidence. The 100-detection envelope is a payload limit, not a claim about model capability.

MongoDB will be portable/project-local if official ZIP execution succeeds. It must bind only 127.0.0.1, use dedicated port 27117, replica set rbm1 and database recyclebin_m1_scratch. No Windows service, PATH, firewall or existing instance is changed. Scratch records are synthetic and retained; no drop/delete cleanup is authorized.
