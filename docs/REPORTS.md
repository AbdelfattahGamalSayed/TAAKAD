# Structured reports: demo boundaries and moderation

Implemented 22 November 2026. This is a shared, temporary demo service, not a police reporting platform. Real SMS and persistent accounts remain unavailable. Use synthetic examples on a trusted development network.

## User journey

Guests can read the awareness feed, flag a harmful post and fill in the three-question form. The questions cover channel, requested action, outcome and whether help is needed. Sign-in is required before sending a report to the backend. Draft answers survive the trip to demo sign-in.

The server generates both language versions from fixed category labels. The public preview is immutable: publication takes only its ID and explicit consent, never replacement text from the client. Editing requires another preview and approval. Reports carry the user's claim of a suspected scam, not verified facts.

Free-text notes, the help-needed answer, ownership and moderation information are held in a separate private record. None of these fields is serialized by the public endpoint. No phone number or identity detail is attached to a report. Users are asked not to enter personal details; private notes are available only to the originating demo session and the locally authorized moderator. Evidence upload is intentionally unavailable; originals should remain with the user.

## Status and lifetime

- `checking`: optional AI check is running; publication is blocked.
- `draft`: preview generated; not published and not consented.
- `published`: the exact approved summary is visible in this demo's awareness feed.
- `held`: personal-information/content rules or the requested AI check require a moderator decision. AI failure also holds publication.
- `flagged`: a reader flagged a published report; it is removed from the feed pending a moderator decision.
- `withdrawn`: the author withdrew it; the public record is removed and the private note erased.
- `rejected`: a moderator rejected the submitted summary.

No status implies police receipt, investigation, assignment or contact. Requesting help only records that choice; the app links to recovery and verified official help instead of promising a callback.

An independent, optional [support handoff demonstration](SUPPORT-HANDOFF.md) shares only the generated summary and a fixed fictional contact with a separately authorized local support role. It requires separate consent; public posting is not required. Private notes, sign-in numbers and evidence are excluded. Support status and public-report status are separate. Withdrawing the report revokes demo support access too.

Records live only in server memory, for at most the originating session's remaining one-hour lifetime. Restarting the server removes them. Signing out loses access to that session's private reports; signing into the same demo number does not prove ownership or recover them. This restriction avoids letting an unverified number claim someone else's private data. Published summaries can remain visible until expiry even after sign-out; withdraw first if desired. A production service needs real authentication, durable secure storage, retention/deletion controls and a staffed moderation process.

## Moderation and abuse controls

Public content is built exclusively from allowlisted categories, so user-entered names, phone numbers, links and free text cannot enter the public template. Separate best-effort checks normalize Unicode and look for possible phone/ID numbers, email, links, identity phrases and harmful/promotional language in the private note. These checks are incomplete and are not a safety guarantee. A detected concern holds publication even though the public template omits the note.

Optional AI moderation sends **only the generated public summary** to OpenAI, with an explicit opt-in. It returns allow/hold; no AI-generated text is published. It does not inspect private notes, verify facts or replace human review. Declining AI keeps the deterministic template/check path available. AI failure holds the submission rather than silently treating it as safe.

Preparation limits: 5 requests/session/hour, 20/socket IP/hour, 100 globally/hour, and at most 200 in-memory records. Identical submissions are deduplicated per session. Flags are limited to 5/IP/10 minutes and 100 globally/hour, with one effective flag per IP/report. One accepted flag immediately hides the post; this favors privacy but can be abused to suppress content, so a moderator can review it. Limits reset on restart and clients may share the proxy's IP; these are demo safeguards, not production abuse prevention.

## Local moderator commands

Start the app with `npm.cmd start`. In a second VS Code terminal, use:

```powershell
node scripts/moderate-reports.mjs list
node scripts/moderate-reports.mjs approve REPORT_ID
node scripts/moderate-reports.mjs reject REPORT_ID
```

`list` includes private notes for held/flagged reports; do not share terminal output publicly. Approval can publish only an already-consented, fixed summary; a draft or withdrawn report cannot be approved. Decisions update the author's actual status after Refresh.

The server generates a separate secret in ignored `.local/report-moderator.json`. It is not bundled in Expo, sent to app clients, or forwarded by the Metro proxy. The CLI reads it locally and contacts localhost:8787. The ordinary pairing token and demo login do not grant moderation access. Never commit this file or embed its token in a client/admin UI.

## Verification limits

Automated tests cover consent, exact preview publication, private/public serialization, cross-owner denial, forged sessions, moderation authorization, AI hold/failure, pending-AI race prevention, duplicate/rate limits, flags, withdrawal and expiry. Browser tests exercise both languages and the actual local server with synthetic reports. They do not establish production identity security, legal compliance, factual truth, real authority integration or measured AI moderation accuracy.
