# Local demonstration and submission checklist

1. Run `scripts/Start-Local.ps1` or the manual two-terminal commands in README. Open http://127.0.0.1:3000 . Show that the application is local.
2. Open guide, search `แบตเตอรี่`. Explain that battery detection is unsupported in the current model and there are no invented SPU KK bin colors.
3. Open Scanner, upload `ml/test-images/empty-bottle.jpg` (Echendu Tracy, CC0). Run real Photo inference. Point out label, confidence and bounding box. Confidence is not accuracy; a detected object may still be reusable.
4. Upload `ml/test-images/bottles-for-recycling.jpg` (Radulf del Maresme, CC BY-SA 4.0; attribution in that directory). Show multi-object output. Explicitly point out false positives and low-confidence objects. Do not claim a measured accuracy rate or detection of every bottle.
5. Show Unknown using a plain background. If an image is dark/unfocused, explain the quality flag is a coarse heuristic, not a validated focus model.
6. Camera mode: request camera permission, start, inspect continuous results, capture snapshot and stop. If physical camera/permission is unavailable, demonstrate Photo mode and mark physical camera Pending. Automated evidence uses Chromium synthetic video, not a real webcam.
7. Run the local quiz and submit answers. The score is calculated by the Local API, not a fake login/database result. Score persistence to a member account is not implemented.
8. Show Login/Profile/History/Admin Not Configured status. Explain cloud project/migration approval and credentials are still missing. No sample account or fabricated dashboard totals are presented.
9. Show verified-rule Pending status and that prediction does not automatically create a confirmed disposal.
10. Open evidence: build/typecheck/tests, GPU arithmetic, model comparisons, responsive screenshots and baseline checks. Explain exactly which tests are local and which require hosted Supabase or real users.

Before submission: review the generated development report, confirm the two test-image licenses travel with the images/screenshots, collect screenshots with no private data, test the physical webcam, provide verified campus data and finish teacher-required TC inputs. Avoid presenting the cloud-dependent feature set as complete.

No deployment, public tunnel, Git commit/push or paid service is part of this demonstration.
