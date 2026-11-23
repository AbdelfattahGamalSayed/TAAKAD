# TAAKAD / تأكّد

**An Arabic/English AI-assisted scam-checking MVP for the Abu Dhabi Police × 42 Abu Dhabi hackathon.** Designed for the general public, including older users: large labelled controls, short steps, optional explanations and practical next actions.

This repository contains the mobile/web source, Node backend, bundled learning media, dependency lockfile, tests and technical documentation. Submission branch: **`master`**. TAAKAD is a prototype, not an official police service, verified identity system or guarantee of safety.

## Start here: reviewers

**You do not need the author's Expo account, computer, API key, hosted backend or EAS project.** Run your own copy of the source. Each checkout creates its own private development tokens.

There is one platform restriction: **current Expo Go on a physical iPhone requires the Expo CLI on your computer and Expo Go on your phone to be signed in to the same Expo account. Use your own account on both.** A QR code served by the author's signed-in CLI is not the independent-review route. This rule comes from Expo, not TAAKAD, and is not bypassed by a tunnel. Android Expo Go and the browser are not subject to that iPhone requirement. See [Expo's account requirement](https://docs.expo.dev/troubleshooting/expo-go-sign-in-required/) and [starting a project](https://docs.expo.dev/get-started/start-developing/), checked 23 November 2026.

For **no Expo login at all**, use the browser review command below. For a future account-free installed iPhone app, a separately signed/distributed build would be needed; no signed build is included here.

### Prerequisites

- Node.js **22.18 or newer** with npm; Node 22.18 is the CI baseline.
- Git or a complete source ZIP. The repository is public and can be read or downloaded without signing in.
- For phones: Expo Go compatible with **SDK 58**, and a trusted Wi-Fi network shared with the computer.
- For browser preview: a modern browser. Automated UI tests specifically use installed **Google Chrome**.
- For real AI transcription, assessment and optional AI moderation: internet access and an **OpenAI API key with model access and available quota**. A ChatGPT subscription is not API credit.
- No Apple Developer membership, EAS build, database, SMS provider or author's Expo login is needed for this source-based MVP.

### Fresh checkout — Windows PowerShell

Run these commands in the downloaded project folder, not its parent. If using Git:

```powershell
git clone --branch master https://github.com/AbdelfattahGamalSayed/TAAKAD.git TAAKAD
cd TAAKAD
npm.cmd ci
npm.cmd run setup
```

`setup` creates a private `server/.env` from the committed blank example **only if it is missing**. It never overwrites an existing key.

For real AI, open `server/.env` in your editor and privately set:

```dotenv
OPENAI_API_KEY=your-own-api-key
OPENAI_MODEL=gpt-4.1-mini
```

Do not commit or share that file. The model can be changed to a compatible model supporting images and structured Responses API output; compatibility must be tested.

Choose one run mode:

| Mode | Command | Account requirement |
| --- | --- | --- |
| Expo Go on a phone | `npm.cmd start` | Physical iPhone: your own matching Expo account in CLI and Expo Go; Android: no author account |
| Browser review | `npm.cmd run review` | No Expo login; opens localhost web preview |
| Normal web preview | `npm.cmd run web` | No author account; normal Expo network checks |

For a physical iPhone, before `npm.cmd start`:

```powershell
npx.cmd expo login
npx.cmd expo whoami
```

Sign in to Expo Go on the iPhone with **that same reviewer-owned account**, then scan the terminal QR with the iPhone Camera and open it in Expo Go. On Android, scan from Expo Go. Keep the terminal running and allow the phone to access the local network.

Both run commands start the backend on **127.0.0.1:8787** and Metro on **8081**. The client reaches the backend through Metro's `/api` proxy; do not expose port 8787. Browser review is available at **http://localhost:8081**. The launcher clears Metro's transform cache so a fresh checkout uses its own development token. Stop both processes with **Ctrl+C**. Do not run two launchers on the same ports.

`review` uses Expo CLI's `--offline` option to avoid Expo account/network services; **this does not make AI or official feeds offline**. Those still need their normal internet connections. Open the browser preview at localhost. Expo offline mode still advertises a LAN development server; use a trusted network and stop it after review. Use `npm start` for the normal phone workflow.

### macOS or Linux

The same source and launcher work with npm/npx:

```sh
git clone --branch master https://github.com/AbdelfattahGamalSayed/TAAKAD.git TAAKAD
cd TAAKAD
npm ci
npm run setup
# Privately edit server/.env for real AI.
npm start
# Or, instead of npm start:
# npm run review
```

For a physical iPhone use `npx expo login` and the same account in Expo Go. No Xcode is required for Expo Go. Do not run `npm run ios` on Windows; that command targets the macOS iOS Simulator.

### What works without an OpenAI key?

Language/theme/topic settings, bundled visual guides and videos, recovery guidance, demo sign-in, structured reports with AI moderation **unchecked**, and the support demonstration can be reviewed without an AI key. Official alerts still need an internet-accessible approved feed and can honestly show unavailable or stale content.

Screenshot reading and live message analysis require the key. **Missing keys do not trigger fabricated AI results.** Optional AI moderation failure holds a report for review. Automated tests use synthetic data and mocked model responses, so they do not require a key or incur model charges.

### Suggested judging walkthrough

1. Continue as guest; switch Arabic/English and light/dark mode.
2. With an API key configured, paste a practice message in Check, answer the relevant questions, consent and view the warning level/actions. A score is not a probability.
3. Select a **non-private synthetic screenshot**. The whole photo is used unless native cropping is chosen. The pre-picker notice covers external transcription; clear readings proceed to context questions, while unclear readings require correction. Optional text editing remains available before final consent.
4. Open “I already clicked something. Help me!” and follow the relevant recovery steps. Do not place test calls to police/emergency services.
5. Inspect Alerts: source/date, earlier/stale labels, optional excerpts and topic filters. Availability reflects the source, not the absence of scams.
6. Open Learn: three-step guides and silent 24-second videos with written alternatives.
7. In Community, complete the three report questions. Sign in using a **synthetic number**, for example `+971500000000`, and the demo code shown in the app. No SMS is sent and no number is verified.
8. Approve the exact public summary with separate consent; inspect My Reports and withdraw it. Private notes never appear in the public feed.
9. Try the separately consented support demo using the fixed fictional contact. It shares only with local demo support, not an authority. Revoke access from My Reports.

Local reviewer tools, in a second terminal while the launcher is running:

```sh
node scripts/moderate-reports.mjs list
node scripts/moderate-reports.mjs approve REPORT_ID
node scripts/moderate-reports.mjs reject REPORT_ID
node scripts/support-cases.mjs list
node scripts/support-cases.mjs open CASE_ID
node scripts/support-cases.mjs close CASE_ID
```

Moderation output can include private notes; use synthetic content and do not publish that output. The two local roles have separate ignored secrets and permissions. See [reports](docs/REPORTS.md) and [support handoff](docs/SUPPORT-HANDOFF.md).

## Problem and solution

Impersonation, unexpected delivery fees, urgent payments and requests for verification codes can be hard to recognize, particularly for users unfamiliar with technical security language. TAAKAD lets a person choose a suspicious message, link or screenshot, understand visible warning signs, and take a safer next step.

The app combines AI reasoning, exact quoted evidence, separate hostname-reputation evidence, relevant user context, guided recovery and official UAE awareness updates. It never automatically monitors SMS/WhatsApp or visits a suspicious destination.

## Current brand and home screen

The app/project name is TAAKAD. Home offers two large actions: Add a screenshot and Paste Text (messages or links). Optional native cropping is under More details. The user-provided blue/navy palette is used throughout; green/amber/red are reserved for result indicators, with readable text variants and a matching dark theme. Results show a primary next action, with extra guidance under More details. Low-risk copy never guarantees safety. Legacy local preference keys remain for continuity. The repository and local project folder are named TAAKAD.

## Implemented MVP

| Area | Current behavior |
| --- | --- |
| Check | Screenshot-first journey; optional native crop; background transcription; correction when unclear; optional context questions; consented text assessment; warning level 1–5 or insufficient information |
| Results | Plain-language next actions first; optional quoted evidence, separate URL/reputation clues and limitations; low risk never means guaranteed safe |
| Recovery | One question at a time; relevant password/code/payment/card/link steps; original blocking/reporting illustrations; user-initiated official contact routes |
| Alerts | Only approved Abu Dhabi Media Office RSS feeds; publisher/link/date retained; earlier, stale, empty and unavailable states; optional local topic filtering |
| Learn | Four bilingual illustrated guides; two original 24-second silent videos per language, local playback controls and written steps |
| Community | Three structured questions; exact preview approval; sanitized shared demo summaries; private own-report statuses/notes; withdrawal, flagging, rate limits and local moderation |
| Support | Clearly labelled local demonstration; separate consent, fixed fictional contact, revocation and actual demo access events; no external handoff |
| Identity | Guest access to all public features; demo phone-code flow for posting/private reports; UAE PASS explicitly unavailable |
| Settings/accessibility | Arabic RTL/English LTR, large labelled controls, light/dark/system appearance, reduced-motion support, local topics, clear-result and report-access controls |

Native crop behavior differs by platform: Expo Go's iOS crop editor uses a square selection; Android uses its native picker/editor. Browser upload uses the whole photo. These are prototype constraints, not a custom editor.

## Architecture, model choices and trade-offs

```text
Expo SDK 58 / React Native / Expo Router (iOS, Android, web)
    -> Metro development server and /api proxy (8081)
    -> Node HTTP backend (localhost:8787)
         -> OpenAI Responses API: transcription / assessment / optional moderation
         -> Phishing.Database fixed domain feed: cached exact-hostname matching
         -> Approved Abu Dhabi Media Office RSS: filtered awareness cache
         -> Temporary demo auth, private reports, public summaries and support records
```

- **Expo/TypeScript:** one bilingual UI and fast Expo Go testing. Trade-off: Expo Go account/version constraints, no signed installable app, widgets or production push integration.
- **Node HTTP service:** portable, small backend; keys never enter client code. In-memory state makes the demo easy to run but non-durable. The LAN pairing token is not production authentication.
- **OpenAI `gpt-4.1-mini`:** a practical image/text and schema-constrained starting choice, not a demonstrated best model. No team-trained/fine-tuned model or representative accuracy benchmark exists. A screenshot normally uses two model requests (read image, then assess text); a pasted message uses one. Optional report moderation adds a separate call on the public summary only.
- **Structured output and validation:** constrain response shape and reject evidence quotes absent from submitted text. They cannot eliminate model errors, prompt injection or incorrect transcription.
- **Context:** local bilingual keyword rules choose useful questions. Answers are unverified and never proof that a sender is genuine. Messages without links can still score 4 or 5 for code requests, impersonation or payment scams.
- **Reputation:** exact visible-hostname matching against a fixed public feed. Listed hosts impose a minimum overall warning level of 4; the AI message score remains separate. No match is not clearance. Up to ten visible links are checked; no redirects, page fetching or active probing. Cache: one hour fresh, up to 24 hours stale during failure, then unavailable.
- **Official alerts:** one approved UAE publisher, fixed feed/link allowlists, robots checks, conditional requests, hourly collection and backoff. No article crawling, social media or commercial-news ingestion. Source-provided text is not AI-rewritten or translated. Optional keyword topics can miss relevant articles; All topics restores general updates. See [source permissions and operation](ALERTS-SOURCES.md).
- **Reports:** fixed public templates prevent user free text from leaking into public summaries. Best-effort personal-information rules and optional AI assistance can hold publication; neither verifies truth or guarantees safe content. Flags hide posts pending review. See [report design](docs/REPORTS.md).

## Privacy and security design

| Data | Destination and retention |
| --- | --- |
| Selected screenshot | Sent to OpenAI only after the visible pre-picker notice and confirmed selection; cancel sends nothing. Optional crop, otherwise whole photo. Backend does not intentionally log/save it; OS caches can persist |
| Message, claimed sender, context | Sent to OpenAI on final assessment consent. Image is not sent again for text assessment. Current drafts/results are temporary app state, not scan history |
| Language, appearance, topic, welcome flag | Saved on this device; topic choice is not sent to the server |
| Demo number/code/session | Local backend only; keyed digests, temporary challenges and opaque one-hour sessions. No SMS provider, no verified identity. Session tokens are not in AsyncStorage or URLs |
| Report/private note | Separate temporary private server record, accessible to its originating session and authorized local moderator; at most session lifetime/one hour |
| Approved awareness summary | Shared with this demo server's users only after exact-preview consent; no note, phone, identity details or private evidence |
| Optional report AI moderation | Only the fixed public summary goes to OpenAI, under separate opt-in |
| Support demonstration | Only approved summary and fixed fictional contact to the separately authorized local role, under distinct consent; no private note, real contact, evidence or authority delivery |
| Feed requests | Source receives ordinary connection metadata, never a user's submitted URL/message/image. Caches remain in server memory |

OpenAI requests set `store: false`, which does **not** guarantee zero provider retention. Provider data policies apply. Remove private details before choosing an image or submitting text. No automatic access to messages, contacts or microphone is requested.

The server does not intentionally persist/log scan content, secrets or provider error bodies. Report/auth/support state expires and disappears on server restart. Signing out loses the private report session; signing in with the same unverified demo number cannot recover it. Consented summaries/support access can remain until expiry; withdraw/revoke before signing out if desired. Withdrawal prevents future demo access but cannot undo previous viewing. See the linked privacy details for exact limits.

`server/.env`, `.local/`, tokens, caches, `node_modules/` and exports are ignored by Git. Startup generates unique local pairing, moderator and support secrets; never copy them between reviewers. The pairing token appears in the development bundle; staff tokens do not. Current LAN transport is HTTP: use a trusted development network and synthetic examples. Public deployment needs HTTPS, real identity, secure token storage, persistent access controls, audit/retention policies and stronger shared abuse controls.

## Demo identity and authority boundaries

Demo codes are displayed deliberately. They expire after five minutes, are one-use, permit five attempts and have a 30-second resend delay; resend invalidates the previous code. Starts are limited to five/number/hour, 20/socket-IP/hour and 100 globally/hour; verification is limited to 30/IP/ten minutes and 300 globally/hour. Limits are in memory and clients can share the proxy IP. Every successful session is explicitly `mode: demo`, `phoneVerified: false`.

Guests can use Check, Alerts, Learn, recovery and read/flag Community posts. Demo login is required to submit reports and access the session's own private records. Real SMS and UAE PASS cannot be enabled merely by adding a key.

**No receiving authority or agreed support process exists.** A community post is not a criminal report and does not promise a callback. Aman is presented as an information channel, separate from formal reporting and emergencies, following its official FAQ. Contact actions are user initiated and never transmit a report automatically. See [verified recovery sources](docs/RECOVERY-SOURCES.md) and [handoff design/organizer approval gates](docs/SUPPORT-HANDOFF.md).

## Tests, exports and reproducibility

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:ui
npx.cmd expo export --platform all --output-dir .local/export
```

Use `npm`/`npx` on macOS/Linux. Optional compatibility diagnostics: `npx expo-doctor`. Do not blindly apply a forced dependency downgrade.

Backend tests use synthetic data and mocked providers. Browser tests use installed Chrome, isolated browser storage and a 390×844 viewport; they start/stop the launcher or reuse an already-running one. AI results/feed scenarios are mocked; demo-auth/report tests exercise the real local backend. No personal data or real SMS is needed. Restart any manually running launcher before a fresh auth test run so earlier rate limits do not interfere. Test artifacts are ignored under `.local/`.

Verification on 23 November 2026 used a separate source copy with fresh dependencies, a blank API configuration and an isolated empty Expo credential store. Reviewer startup returned HTTP 200, and live analysis correctly returned API_NOT_CONFIGURED without a key. All 70 backend tests, typecheck, lint and iOS/Android/web exports passed. All 64 browser regression tests passed, covering the TAAKAD home layout, Arabic/English, dark mode and result contrast. Live synthetic AI checks and user-confirmed native screenshot/crop tests occurred in earlier iterations. The newest learning-video/native changes still need physical-device verification. Web tests, a manifest check and exports are **not** proof of logged-out iPhone behavior or signed App Store builds.

See [learning-media provenance](docs/LEARNING-MEDIA.md) for reproducing the bundled clips. Their source and output files are committed, so ffmpeg is not a runtime/install prerequisite.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| iPhone reports Expo account mismatch | On the reviewer's computer run `npx expo whoami` / `npx expo login`; sign in to Expo Go with that same account and restart the launcher after switching accounts. Do not use the author's credentials |
| Expo SDK/version mismatch | Use Expo Go supporting SDK 58. iOS App Store availability can change; follow [Expo's mismatch guidance](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/). Browser review is available; a future SDK migration must be tested |
| Phone cannot connect | Same trusted Wi-Fi, local-network permission, private-network firewall access for Node/8081, and no guest/client isolation. Avoid VPN interference. Use browser review if the network blocks peer traffic |
| Ports 8081/8787 already in use | Stop the existing TAAKAD terminal with Ctrl+C; do not start a second copy. Do not terminate unrelated services |
| AI unavailable | Check private `server/.env`, valid API key, quota, compatible model and internet. Settings shows connectivity; the backend reads key configuration on each request |
| Alerts empty/unavailable/stale | Source restrictions or outages may prevent collection. Refresh reads the cache; it does not force additional upstream scraping. Try later; no result is not evidence of no threats |
| Demo report/session disappeared | Expected after reload/sign-out, expiry or server restart; this MVP does not persist accounts or cases |
| Browser tests cannot launch Chrome | Install Google Chrome. Other browsers can preview the app, but the configured automated suite uses Chrome |
| Video fails | Use the complete written guide beneath it. Check SDK compatibility on the device |

A tunnel is an optional network workaround, not an account workaround: `npm start -- --tunnel` forwards the flag to Expo. It may require Expo's ngrok dependency and makes the development server externally reachable. It is not the default or a hosted production deployment.

## Code map

| Path | Purpose |
| --- | --- |
| `src/app/` | Expo Router screens: five tabs, welcome/sign-in, results and recovery |
| `src/components/` | Accessible UI primitives, topics, support and video playback |
| `src/lib/` | Bilingual copy, state, API contracts, context/recovery rules, learning scripts |
| `server/index.mjs` | HTTP routes, pairing and role boundaries |
| `server/analysis.mjs`, `server/model.mjs` | Schemas, validation and stateless OpenAI calls |
| `server/reputation.mjs`, `server/alerts.mjs` | Fixed-source reputation and official alert caches |
| `server/auth.mjs`, `server/reports.mjs` | Temporary demo auth, public/private reports and support |
| `scripts/setup.mjs`, `scripts/dev.mjs` | Non-destructive first setup and cross-platform combined launcher |
| `assets/learning/` | Original bilingual silent videos and scoped reuse license |
| `server/*.test.mjs`, `tests/` | Backend/helper tests and Playwright browser tests |
| `docs/`, `design-system/` | Sources, moderation/handoff/media details and UI design system |
| `.github/workflows/checks.yml` | CI install, backend tests, typecheck and lint |

## Known omissions and future improvements

- No real SMS identity, UAE PASS, durable database, authority integration or staffed response service.
- No automatic SMS/WhatsApp monitoring, native widget, scheduled daily notifications, voice cloning or TTS.
- No signed installable release, hosted production backend, or production security certification.
- AI/reputation/keyword filters can be wrong, stale or incomplete. No measured detection accuracy or “safe sender” guarantee.
- Native Android behavior and the latest iPhone video/accessibility behavior need physical testing; development network and Expo version/account restrictions remain.
- The last install reported three moderate dependency advisory records in Expo tooling; no forced downgrade was applied. Re-run `npm audit` for current status.

With more time: evaluate on a labelled bilingual scam/benign dataset; measure false positives and transcription errors; improve accessibility with older-user testing; add real secure accounts/storage and consent lifecycle; obtain a receiving-team agreement and verified delivery process; add official sources only after permission review; prepare a signed release and operational security review.

## Competition requirements and submission checklist

This README addresses the supplied requirements for **problem/solution, technical reasoning/trade-offs/omissions, architecture/model/privacy documentation, and reproducible build/run instructions**. It does not certify team eligibility or confirm final delivery through the submission portal.

- Keep the **entire MVP and README on `master`**, including source, lockfile, assets, tests, safe configuration example and third-party notices.
- Repository: [AbdelfattahGamalSayed/TAAKAD](https://github.com/AbdelfattahGamalSayed/TAAKAD). It is public; anonymous access was verified on 23 November 2026. Keep the published `master` synchronized with the final tested source before submission.
- Submit the repository link through the organizer's submission application by the confirmed deadline. Repository creation alone is not submission; retain receipt and exact commit.
- The team must confirm registration, truthful participant details, **3–5 members**, originality/contribution history, third-party rights, and any later organizer changes.
- Participants retain ownership under the supplied terms. The repository's existing Expo template MIT notice does not establish authorship of team contributions. Review [third-party notices](THIRD_PARTY_NOTICES.md), [media provenance](docs/LEARNING-MEDIA.md) and asset permissions; retain upstream licenses.
- AI coding assistance and external pretrained models are not claimed as team-trained models or wholly independent authorship. Confirm any additional organizer disclosure rules.
- Do not submit credentials, private reports/screenshots, `.local/`, `node_modules/` or development tokens. Test a clean checkout of the exact submitted commit.
- The editable presentation, Word project description and project-card text are in [submission/](submission/README.md). The team must upload these and supply its recorded one-minute demo video; AI-generated demo video is prohibited. Campus conduct, confidentiality and responsible-network rules still apply; no probing or unauthorized access is part of TAAKAD.

See [SUBMISSION-CHECKLIST.md](SUBMISSION-CHECKLIST.md) for the full mapping and outstanding administrative/release checks.
