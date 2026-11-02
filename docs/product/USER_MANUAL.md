# User manual

Open the local website. Home shortcuts lead to search, AI scanner, knowledge and personal statistics. Mobile uses bottom navigation; tablet uses the menu; desktop uses the header.

Search by Thai name or synonym, filter categories and open an item for detail. General guide content is labeled separately from published area data. Select material only after checking the object yourself. A detected Bottle does not prove plastic. Follow a verified local rule/source only when shown; Pending Verification means no confirmed bin/color/location recommendation is available.

Photo Scanner: select JPEG/PNG/WebP up to8MB, inspect preview, choose ตรวจจับภาพ. The real model returns boxes, labels and scores. Low Confidence/Unknown/blur warnings require checking or retaking the image. Confidence is not accuracy. No detection does not mean no waste exists.

Camera: allow camera for localhost, select Real-Time, open camera, adjust interval if needed. Requests are sequential. Stop closes tracks. Snapshot stops the camera, freezes the actual captured image and runs inference on that image again; only that frozen result can be saved. Download Snapshot saves a file only when you click it. Changing mode/leaving the page stops camera use.

With configured Supabase, register and follow email confirmation, login and use recovery if needed. No OAuth buttons are offered without configured providers. A Not Configured message is not account creation success.

Save scan records the result metadata in your account, not the original image. A result must be signed for your current account and saved within five minutes; rescan if expired. History opens your saved result/provenance. Saving a prediction never increments disposal counters.

Only after actually disposing of the item, choose the verified rule/material, enter actual quantity, and confirm. Retry the same event on a transient network error. Statistics count persisted events and quantities, not inferred weights or environmental impact.

Profile edits your display name; Settings verifies current password before a change. History, disposal history and learning progress are account-specific. Contact/Feedback allow actual messages and issue reports after login, and show your submission history. Do not include sensitive personal information in messages.

Knowledge contains authored system explanations and published DB articles. Account quizzes are graded on the server and saved; the separate practice exercise is not an account result. The map shows only source-backed verified locations, list view by default. OpenStreetMap loads externally only after choosing a real location and map view.

## Continuation 2026-11-02

Snapshot now waits for any already-running AI request to finish before re-inferring the frozen frame, avoiding a race with its own inference slot. Camera tracks close immediately. An interrupted disposal request retries the original full event, including quantity and original scan references. Quiz answers are locked while submitting and when retrying an uncertain submission. Older saved results with incomplete/malformed object metadata show an explicit unreadable notice; no substitute detection is created.
