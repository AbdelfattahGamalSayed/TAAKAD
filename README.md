# T2AKKAD / تأكّد

Bilingual Expo Go SDK 58 prototype for reviewing suspicious messages, screenshots and links.

## Problem and solution

Unexpected delivery fees, impersonated institutions, urgent payment requests and requests for verification codes can be difficult to assess, especially across Arabic and English. T2AKKAD helps a user review a message they choose to share, understand visible warning signs, and decide on safer next actions.

The MVP combines an AI assessment with exact quoted evidence and a separate hostname reputation check. Screenshots are transcribed first and reviewed by the user before assessment. It is decision support, not a guarantee of safety or an official police service. Official UAE RSS updates and offline educational/recovery guidance provide additional context.

## Architecture and technical choices

```text
Expo / React Native UI (English + Arabic)
  -> Metro /api proxy during development
  -> Node HTTP backend (validation, pairing token, request limits)
       -> OpenAI Responses API: screenshot transcription OR text assessment
       -> Phishing.Database: fixed public feed, local hostname matching
       -> Approved Abu Dhabi Media Office RSS feeds: Alerts cache
```

- **Expo SDK 58, React Native and Expo Router:** one TypeScript UI for iPhone and Android, with a web preview and fast Expo Go iteration. Trade-off: Expo Go does not deliver our planned native widgets or a standalone production app.
- **Node.js backend:** separates credentials and provider requests from the client. The small HTTP service is easy to reproduce for judging; it deliberately has no user database. Its shared development token and global request limits are not production account security.
- **OpenAI `gpt-4.1-mini` by default:** a practical starting choice for image input, bilingual text and schema-constrained responses in one integration. This is a design choice, not a benchmark showing it is the best model. `OPENAI_MODEL` can override it with a compatible model. We have not trained or fine-tuned a model, or measured detection accuracy on a representative labelled dataset. A screenshot check normally uses two separate model requests; a pasted-message check uses one.
- **Structured responses plus server validation:** constrain output shape and reject invented evidence quotes that do not occur in the input. This improves inspectability but cannot eliminate incorrect reasoning, mistranscription or prompt injection.
- **Separate reputation evidence:** deterministic exact-hostname matching supplements the model. No browsing of suspicious destinations is performed; redirects and page contents remain unknown.
- **Approved RSS feeds:** a fixed allowlist, robots checks, caching and backoff provide a narrow, attributable news integration. Keyword filtering and a single publisher limit coverage. There are no generated news stories or invented translations.
- **No persistent scan history or live community yet:** limits stored personal information and keeps the MVP small. Demo sign-in exercises the flow without verifying phone ownership. Real accounts, moderation, notifications and widgets are deferred.

## Privacy design

The user selects text or a photo; the app does not read SMS or WhatsApp in the background. Screenshot transcription requires explicit consent to send the selected image to OpenAI. The user then reviews/edits the extracted text and consents again to text assessment. Pasted text, the optional claimed sender and optional context answers are also sent only with consent. Remove sensitive details before transmission; cropping is optional, and without cropping the whole selected photo is used. The current photo and edited draft remain in app memory for Back navigation; they are cleared when removed/replaced or after successful assessment, and are not saved as history.

The backend keeps requests in memory and does not intentionally persist or log message/image content. OpenAI requests set `store: false`; this does not promise zero retention by the provider. Only language, theme and the welcome-dismissed flag persist in app storage. The OS/photo picker may retain temporary images. Feed requests disclose ordinary connection metadata to the source, but do not include the user's message, URL or image. Public feed caches are held in server memory. Demo sign-in and Community draft privacy are described below.

The API key stays in private server configuration. The Expo bundle includes a development pairing token, so use a trusted demo network with synthetic examples. Current LAN traffic is HTTP. A public deployment requires HTTPS, real authentication, per-user abuse controls, a deployment-specific privacy review and appropriate retention/deletion controls before storing user content.

## Run from VS Code

Open the T2AKKAD folder, open Terminal → New Terminal, and run:

```powershell
npm.cmd start
```

This starts both the local backend (127.0.0.1:8787) and Expo (8081). Scan the QR code in Expo Go. Keep the iPhone and computer on the same trusted Wi-Fi. Stop both with Ctrl+C. Do not start a second launcher while one is already running.

For a fresh source checkout, run `npm.cmd ci` first to install the committed lockfile. Copy `server/.env.example` to `server/.env` only if the latter does not exist, and privately set OPENAI_API_KEY. Never put that key in client code. Node.js 22.18+ and Expo Go SDK 58 are required. Internet access and an OpenAI API project with available quota are needed for real analysis; mocked tests do not require an API key. On macOS/Linux, use `npm`/`npx` instead of `npm.cmd`/`npx.cmd`.

From a fresh clone in Windows PowerShell:

```powershell
npm.cmd ci
if (!(Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
# Privately edit server/.env to set OPENAI_API_KEY, then save.
npm.cmd start
```

To check JavaScript bundles for all three platforms:

```powershell
npx.cmd expo export --platform all --output-dir .local/export
```

An export is a bundle check, not a signed mobile binary. The executable MVP is demonstrated through Expo Go and the running backend. A standalone signed build and production hosting are future work.

The API key is read on each request. The ignored `.local/session.json` is a development pairing token, not an API key. The development bundle contains that pairing token; this is not production authentication. Metro proxies /api requests to the backend.

## Current features

The Trust Blue visual foundation uses larger labelled controls, a prominent screenshot tile, shared light/dark colours, readable system typography and mirrored Arabic navigation across all five tabs. System font scaling remains enabled; reduced-motion preferences suppress the intro and stack animations. See [the design system](design-system/t2akkad/MASTER.md) for tokens, layout rules and accessibility testing limits. Check now uses a guided journey; production authentication and ticket-based community remain unimplemented phases.

Check starts with screenshot upload or pasting a message/link, then proceeds through editable text review, useful optional questions, and final consent. Back retains the current draft. Local English/Arabic keyword rules select account and password-reset questions without sending data; these rules are intentionally limited and may miss unusual wording. Users can answer Yes, No, Not sure, or skip. Editing text or sender clears prior answers and consent. Leaving Check cancels pending requests and ignores late responses. The confirmation shows a short preview; Edit the message opens the complete text, and the entire reviewed text is submitted.

English and Arabic screens now use shorter, everyday wording. Results put severity and next actions before an optional **More details** section containing quotes, link evidence, scoring explanations and full limitations. The essential uncertainty warning stays visible; low scores explicitly do not mean safe, and reported scam links get a visible warning. Alerts retain original publisher text, dates and old/unavailable labels, while collection metadata moves into details. Settings keeps consent/privacy information and the demo disclaimer visible; troubleshooting and implementation explanations are optional. User-facing errors give recovery steps instead of API-key or terminal instructions. The AI prompt also requests short explanations and action-first advice; this is not a measured guarantee of reading level or model reliability.

- Whole-photo selection by default. No black masks, manual rectangle drawing or percentage controls.
- Optional **Choose & crop** opens the native phone photo picker and crop editor. Canceling leaves the previous selection intact. Expo Go's built-in iOS crop selection is square; Android uses its native crop UI. The browser uses whole-photo selection.
- Preview and explicit consent before sending a screenshot to OpenAI for transcription.
- Editable extracted message and sender. Any edit clears context answers and analysis consent. Only reviewed text, sender and optional context answers, not the image, are sent in the analysis request.
- Exact quoted warning phrases, explanations, evidence strength, a 1–5 ordinal warning level, or insufficient information without a score.
- Public Phishing.Database exact-hostname checks alongside separate URL structure clues. Results distinguish listed, no match, unavailable and stale data. No user URLs are sent to the feed provider and suspicious destinations are never visited.
- Offline guided recovery: five single questions about payments, card details, codes/sign-in approvals, passwords, and links/installations. Yes/No/Not sure answers select relevant steps, with money first and no duplicate bank step. Back preserves answers; edits clear completion reminders. No private details, AI calls, persistent recovery history or reports are collected/sent.
- Original illustrated blocking/reporting guides for WhatsApp, iPhone Messages and Google Messages. Evidence preservation comes first. These simplified diagrams are not platform screenshots; menu labels and availability vary by version/carrier. Reporting to an app is not a police report.
- Verified Abu Dhabi Police Aman contact options, separate formal-report guidance and emergency 999. Phone/SMS buttons hand off to the device; no call is made or message sent automatically. Help is available without finishing the questions. Sources and verification date are recorded in [recovery sources](docs/RECOVERY-SOURCES.md).
- English and Arabic, saved language, Light/Dark/System appearance, accessible controls and a brief opening animation.
- Fictional Community preview with search and filters. Guests can read and draft; submitting a device-local demo preview requires a server-issued demo session. Live accounts and public posting are not implemented.
- Practice messages, educational tips, cancellation and actionable error states.

No automatic message monitoring, official police endorsement, scheduled notifications or native widgets are claimed.

## Welcome and demo sign-in

First-time Check visitors see **Continue as guest**, **Sign in with phone number**, and disabled **UAE PASS — unavailable**. All public tabs, analysis and recovery remain accessible without an account. Settings lets a guest sign in later or end a demo session. UAE PASS has no SDK, endpoint, identity assertion or verified-account behavior.

The user selected a labelled demo because no SMS provider is configured. No SMS is sent. Use the supplied synthetic number `+971500000000`, then enter the six-digit code displayed in the app. The backend creates the code securely, keeps only its keyed digest, enforces a five-minute lifetime and one-time use, allows five attempts, and invalidates the previous challenge on resend. The resend delay is 30 seconds. Limits: five starts per normalized number/hour, 20 per socket IP/hour, 100 globally/hour, 30 verification requests per IP/ten minutes and 300 globally/hour. These limits are in server memory and reset on restart; the development proxy can make clients share an IP. Forwarded-IP headers are intentionally not trusted.

Every successful demo response has `mode: demo` and `phoneVerified: false`. Demo codes are returned to the client deliberately; they cannot prove phone ownership and must never be accepted as production identity. A random opaque session expires after one hour, is stored only in app memory, and is checked by the backend for preview submission. The server stores a keyed token digest. Logout revokes it; restarting the server clears all sessions. If logout cannot reach the server, local sign-out still succeeds and the app discloses that the server session expires within one hour.

Phone inputs go only to the local development backend; the server holds keyed phone digests for limits, not a phone directory. Do not use personal numbers for this demo. No external identity/SMS provider receives them. Session tokens and draft text are never placed in AsyncStorage or URLs. Drafts remain in React state while the user opens sign-in and returns; they clear when discarded or the app is closed/reloaded. Preview authorization sends only `{action: 'preview'}` and the session token, not the draft. A guest or forged/expired session is rejected server-side. No draft is stored or published, and no authority receives it.

**Before real SMS:** choose and configure a provider, verify UAE delivery support and consent requirements, use its server-side verification API, remove demo-code responses from the production path, enforce a distinct real-session trust level, deploy HTTPS and shared durable abuse controls, add secure native token storage and account lifecycle/privacy controls, and test real delivery and failure cases. A phone verification proves control of a number at that time, not a person's identity. The current build intentionally cannot enable real SMS just by adding a key.

## Reputation and scoring

The backend downloads a fixed public domain feed into memory and caches it for one hour. When refresh fails it can use cached data for up to 24 hours with a stale label, then reports unavailable. It rejects corrupt feeds and skips isolated malformed records (at most 1%). Checks match the exact visible hostname; no redirect expansion or website inspection occurs.

A listed hostname raises overall risk to at least 4, with the separate AI message score displayed. Reports can be wrong or outdated. No match never means safe. Up to ten visible links are checked. A score is not a probability or identity verification.

There is no score cap for messages without links: requests for codes, impersonation and payment scams can warrant 4 or 5. Context answers are unverified user reports, not proof of sender identity or safety. The model is instructed to use them to explain the situation without overriding strong scam evidence; this instruction is not a guarantee of correct model judgment.

See THIRD_PARTY_NOTICES.md for the feed's MIT license and attribution.

## Checks

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:ui
npx.cmd expo-doctor
```

The browser tests use installed Google Chrome with an isolated test profile at 390×844. They start the development launcher if needed or reuse a running instance. AI/feed responses are mocked; auth tests use the local demo server with synthetic numbers, plus mocked expiry/error cases. No real personal content, SMS delivery or OpenAI charges are needed. Backend tests mock external providers too. Most regression tests start with the welcome flag dismissed; dedicated welcome tests explicitly clear it. Screenshots and reports go to ignored .local/. Restart the launcher before rerunning auth tests so cooldowns from the prior run do not interfere.

The November 19 verification also used seven live checks with synthetic content, OpenAI and the public feed. The user confirmed whole-photo selection and optional native cropping on an actual iPhone.

## Structure

- src/app: Expo Router screens
- src/lib/api.ts: client API contract
- src/lib/screenshot.ts: native picker options and whole-frame resizing
- src/lib/features.ts: bilingual evidence and recovery copy
- server/index.mjs: paired API routes, validation and rate/concurrency limits
- server/analysis.mjs: transcription and assessment schemas/validation
- server/model.mjs: stateless structured OpenAI calls
- server/reputation.mjs: fixed-source feed cache and URL evidence
- server/*.test.mjs: backend and pure helper regressions
- tests/features.spec.ts: browser flow regressions
- scripts/dev.mjs: one-command launcher

## Prototype limits

LAN development traffic is HTTP. Production requires HTTPS, stronger authentication and abuse controls. The server does not save or log submitted messages/images, keys, or provider error details. OpenAI receives explicitly selected content with store:false; its own retention policies still apply. Selected images can exist in OS-managed temporary caches.

AI outputs remain fallible. Transcription can misread individual URL characters, so review is mandatory. The current assessment is kept in memory; language and appearance are persisted. Community examples and recovery checklist completion are temporary.

Native Android behavior has not been exercised on a physical device. Successful bundle exports are not signed App Store or Play Store builds. npm audit reports one underlying moderate minimatch advisory through Expo's fingerprint tooling (three dependency records); no high or critical advisories were reported. Its suggested forced Expo downgrade would break SDK 58 compatibility, so it was not applied.

## Next milestones

1. Evaluate detection and transcription on a labeled bilingual dataset.
2. Add more official alert publishers after reviewing their automation and reuse permissions.
3. Add authenticated, moderated community discussions.
4. Prepare a signed development build for richer native integrations, widgets and notifications.

## Official UAE alerts

The Alerts tab now reads the published English and Arabic Security, Technology and Community RSS feeds of Abu Dhabi Media Office, one official government publisher. Sources are checked hourly while the backend is running. Only cyber-safety matches are shown, with publication dates, attribution and original links. Older and stale content is labelled. No social media or commercial news outlets are collected; no AI summaries are generated.

See ALERTS-SOURCES.md for the feed-specific permission basis, allowed endpoints, robots rules, backoff, caching, and the procedure for approving more sources.

## Competition submission status

See [SUBMISSION-CHECKLIST.md](SUBMISSION-CHECKLIST.md) for the requirements supplied by the user and the release checklist. The source repository is https://github.com/AbdelfattahGamalSayed/T2AKKAD and the submission branch is `master`. The repository is private; reviewer access must be arranged before submission. Publishing the repository does not submit the competition entry. The README, source, tests, lockfile, safe configuration example and notices must be included in the submitted commit. The team must verify GitHub reviewer access and submit the repository link through the organizer's submission app before the confirmed deadline.

The root LICENSE retains the Expo template's MIT notice; it is not evidence of team authorship or a transfer of ownership to Expo. See THIRD_PARTY_NOTICES.md. Team identity, contribution history and rights to any custom assets must be confirmed by the team. PowerPoint and the separate technical report are outside this app/code review and remain separate submission obligations.
