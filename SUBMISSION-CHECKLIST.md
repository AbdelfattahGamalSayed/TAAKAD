# TAAKAD submission requirements

Baseline: hackathon and 42 Abu Dhabi campus terms supplied by the user on **2026-11-21**. This is an engineering readiness checklist, not a certification of legal compliance. No deadline, scoring weights, repository visibility requirement, AI-assistance prohibition or mandatory self-trained model was specified in the supplied text. Verify later organizer updates rather than guessing.

## Requirement mapping

| Supplied requirement | App/code evidence and status |
| --- | --- |
| Original prototype/MVP and complete source | App, backend, tests, configuration and lockfile are present locally. Team must confirm originality/contribution history and asset rights. Complete source is maintained on the GitHub repository linked in README. |
| GitHub repository link submitted through the submission app | Repository: `AbdelfattahGamalSayed/TAAKAD` (public). Anonymous access verified on 2026-11-23; final competition submission, deadline and submission URL still need confirmation. |
| Entire MVP plus README on `master` | The submission branch is `master`. Review each final commit for complete source and keep it synchronized with the tested version. |
| README problem and solution | Added explicit problem/solution section. |
| README technical reasoning, trade-offs, omissions and future improvements | Added architecture/model rationale/privacy sections; features and prototype limits distinguish implemented behavior from plans. |
| README build/run instructions | Lockfile install, private environment setup, one-command startup, tests and bundle export documented. Fresh source copy installed and verified independent browser startup on 2026-11-23 with no author credentials. Physical iPhone Expo Go requires the reviewer's own matching Expo account; live AI needs their private API key. |
| Technical documentation and PPT covering architecture, model choice, privacy | README plus submission/TAAKAD_Competition_Presentation.pptx and submission/TAAKAD_Project_Description.docx cover these topics. Files are prepared; portal uploads remain outstanding. |
| Respect third-party IP; no plagiarism | Existing Expo template and phishing-feed notices retained. Dependency license metadata reviewed; full redistribution obligations and custom-asset provenance require final team review. Do not represent third-party frameworks or pretrained models as team inventions. |
| Responsible use of systems/network; privacy and confidentiality | No automated access to SMS/WhatsApp, no fetching user-submitted destinations, explicit AI consent, fixed feed allowlists, no intentional logging of submitted content; temporary, separated private report records, synthetic tests. Production privacy/security review remains necessary before public deployment. |
| Registration and team of 3-5 | Administrative: team must verify registration, truthful participant details, eligibility and agreement. Code cannot verify these. |
| Submit before deadline; organizer changes | Team must confirm current deadline and later rule changes, then retain submission receipt and exact submitted commit. |

## Before each feature is accepted

- Keep README and actual behavior consistent, including architecture, data recipients, persistence, external model calls and costs/limitations.
- Preserve informed photo-processing consent and optional screenshot editing; unclear readings require correction. User update 2026-11-24: select once, crop optionally in the local preview or use the whole image, then explicitly Scan photo. Selection/cropping alone must not send the image to OpenAI.
- Never promise safety, sender authentication or measured accuracy without evidence. Clearly label demonstration posts and unavailable/stale feeds.
- Keep secrets server-side and outside Git. Include only blank/safe environment examples. Do not distribute `.local` exports containing development tokens.
- Record permissions and attribution for added assets, libraries and data. RSS access approval does not authorize scraping the entire publisher website.
- Do not add arbitrary URL fetching, network probing or campus-system testing. Use synthetic cases and authorized endpoints.
- Run backend regressions for backend changes, browser regressions for affected UI, and lint/typecheck for every code change. Device-only features need physical-device checks; exports alone do not establish device behavior.

## Final source release gate

- [ ] Confirm team/asset provenance, intended project licensing and attribution. Retain original upstream notices; do not replace Expo's attribution with the team name.
- [ ] Review `git status` and the actual staged diff. Include all app/backend source, assets, package lockfile, README, notices, tests, scripts, configuration and `server/.env.example`.
- [ ] Exclude actual `.env` variants, credentials, private screenshots/messages, `.local`, `node_modules`, generated native folders and local exports. Check the complete Git history before publication, not only the current files.
- [x] TAAKAD app source and reviewer documentation committed and pushed on `master` on 2026-11-23; Git remote confirmed source commit `7d89f9d`. Recheck after subsequent code changes. GitHub repository renamed to TAAKAD on 2026-11-23.
- [x] Repository made public at the user's request and read anonymously on 2026-11-23.
- [ ] Clone that repository into a separate clean directory; run `npm ci`, configure a private key, and verify the documented startup. No local-only file should be needed beyond private credentials and launcher-generated state.
- [ ] Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run test:ui`, and the documented bundle export. Use synthetic demo content and verify the final iPhone flow.
- [ ] Document unresolved issues, dataset/evaluation limitations and third-party dependencies. Do not claim production readiness or benchmark accuracy.
- [ ] Upload the prepared PPTX and project-description DOCX (each under 20 MB), enter the project card (description at most 600 characters), supply a non-AI-generated one-minute recorded demo URL, submit the public repository link before the confirmed deadline and retain the receipt and final commit.

## Audited limitations

Support handoff remains a demonstration at the user's explicit direction: no receiving authority or agreed process exists. Separate demo consent, a fictional contact and a local support role do not establish a partnership. Real sharing is disabled. [Organizer confirmation gates and staff-access design](docs/SUPPORT-HANDOFF.md) must be completed before real case/contact delivery.

The current AI model is externally hosted and not trained by the team. The alerts integration covers one official UAE publisher, not comprehensive threat intelligence. Community now has structured reports, consented shared demo summaries, separate private notes and local moderation. It has no real SMS, verified accounts, durable reporting or authority integration. UAE PASS is explicitly unavailable. Notifications and widgets are not implemented. The LAN server/token setup is for development, not a production identity/security system. These are disclosed scope decisions; the supplied terms do not require these optional features.

The source audit cannot establish when every contribution was created or certify all participant/asset rights. Do not mark these checks complete without evidence from the team. Prior successful automated checks and iPhone confirmations are useful evidence, but the final submitted commit must be verified again.

## GitHub verification on 2026-11-21

Repository created private; default branch is `master`. Source commit `7ece35895f3006174889e6fd6b768bf3fc95ae17` was cloned from GitHub into a separate verification directory. `npm ci`, all 51 backend tests, typecheck, lint and all 16 mocked browser tests passed. GitHub Actions also passed backend tests, typecheck and lint. The browser tests exercised launcher startup without copying private credentials. No new real-provider or physical-device test was performed in this GitHub setup step.

Before the first push, the exact staged contents were checked for private environment/cache paths, the local OpenAI key, the local pairing token and common credential patterns; no matches were found. Only the blank environment example was committed. Reviewer access and competition submission remain outstanding.

## TAAKAD reviewer verification on 2026-11-23

A separate staged-source archive was installed with `npm ci`, without copying author credentials or private runtime state. `setup` generated a blank configuration. An isolated Expo credential store contained no login; the public config had no owner or EAS project binding. Browser startup succeeded and missing-key analysis returned API_NOT_CONFIGURED. All 70 backend tests, typecheck, lint and iOS/Android/web exports passed. Final browser regression results are recorded in README. New physical-device verification remains outstanding. This source check does not certify team eligibility, asset ownership, reviewer repository access or final submission.

## Prepared submission package on 2026-11-23

The project-card text, editable 13-slide PPTX and Word project description are in submission/. The repository is public and anonymous access was checked. The team will handle the required one-minute recorded demonstration and discussion; AI-generated submission video is not permitted. Prepared files are not evidence that the portal submission has been completed.

## Reliability and committee-preview work on 2026-11-24

Live model access, screenshot extraction and synthetic assessment were checked without exposing keys. The reported app failures cleared after combined startup. Bounded client requests and sanitized provider recovery codes are covered by regressions. A published Expo Go preview was created separately from normal source configuration, but the physical test below established that it is account-restricted. The report/presentation retain their 23 November source baseline and need a final demo-workflow review before submission.

## Physical Expo Go access result on 2026-11-24

The user confirmed HTTP 403 while signed out: the EAS Update preview requires owner/account membership. Anonymous manifest download was not proof of Expo Go access. The account-free published-preview route is unavailable under Expo policy. The user selected the browser QR route. `npm run demo` now starts/reuses the app and generates a plain HTTP LAN QR for Safari/Chrome, without an Expo account or installation. The computer must remain running on the same trusted Wi-Fi. Physical-phone browser verification remains outstanding; do not claim a signed-out Expo Go success.

Browser-route checks: 82 backend/helper tests, typecheck and lint passed. A fresh Chrome session at the laptop's actual LAN origin passed guest Check, live synthetic screenshot extraction/AI assessment, Learn guide/video playback and Community API access. The launcher reused the matching running servers without another port binding. The user subsequently confirmed the browser app works. New crop interaction and native-device checks remain separate from that startup confirmation.

## UI and crop-preview verification on 2026-11-24

The updated user direction permits strong red/green/amber accents beyond result cards. The shared photo preview replaces the repeat-picker crop flow on browser and native targets. Selection/cropping remain local until Scan photo; whole-photo use remains the default. Validation passed: 84 backend/helper tests, 75 browser regressions plus 23 final targeted checks, typecheck/lint and iOS/Android exports. Exact crop pixels, whole-image reset, touch dragging, keyboard alternatives, Arabic and both themes were checked. A real synthetic cropped screenshot completed transcription and assessment through the LAN browser app. Physical-device interaction remains a separate acceptance check. Submission documents retain their earlier dated baseline and should be refreshed before final delivery if they describe the previous native-only crop flow.
