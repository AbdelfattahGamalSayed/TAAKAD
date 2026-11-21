# T2AKKAD submission requirements

Baseline: hackathon and 42 Abu Dhabi campus terms supplied by the user on **2026-11-21**. This is an engineering readiness checklist, not a certification of legal compliance. No deadline, scoring weights, repository visibility requirement, AI-assistance prohibition or mandatory self-trained model was specified in the supplied text. Verify later organizer updates rather than guessing.

## Requirement mapping

| Supplied requirement | App/code evidence and status |
| --- | --- |
| Original prototype/MVP and complete source | App, backend, tests, configuration and lockfile are present locally. Team must confirm originality/contribution history and asset rights. Complete source is maintained on the GitHub repository linked in README. |
| GitHub repository link submitted through the submission app | Repository: `AbdelfattahGamalSayed/T2AKKAD` (private). Competition submission is outstanding; reviewer access, deadline and submission URL need confirmation. |
| Entire MVP plus README on `master` | The submission branch is `master`. Review each final commit for complete source and keep it synchronized with the tested version. |
| README problem and solution | Added explicit problem/solution section. |
| README technical reasoning, trade-offs, omissions and future improvements | Added architecture/model rationale/privacy sections; features and prototype limits distinguish implemented behavior from plans. |
| README build/run instructions | Lockfile install, private environment setup, one-command startup, tests and bundle export documented. Fresh GitHub clone installed and passed backend/browser checks on 2026-11-21; live analysis still needs a privately configured API key. |
| Technical documentation and PPT covering architecture, model choice, privacy | Core technical details are in README. Separate report and PPT are outside the user's current requested scope and still required for submission. |
| Respect third-party IP; no plagiarism | Existing Expo template and phishing-feed notices retained. Dependency license metadata reviewed; full redistribution obligations and custom-asset provenance require final team review. Do not represent third-party frameworks or pretrained models as team inventions. |
| Responsible use of systems/network; privacy and confidentiality | No automated access to SMS/WhatsApp, no fetching user-submitted destinations, explicit AI consent, fixed feed allowlists, no intentional storage/logging of submitted content, synthetic tests. Production privacy/security review remains necessary before public deployment. |
| Registration and team of 3-5 | Administrative: team must verify registration, truthful participant details, eligibility and agreement. Code cannot verify these. |
| Submit before deadline; organizer changes | Team must confirm current deadline and later rule changes, then retain submission receipt and exact submitted commit. |

## Before each feature is accepted

- Keep README and actual behavior consistent, including architecture, data recipients, persistence, external model calls and costs/limitations.
- Preserve consent and editable screenshot review; keep optional native cropping and whole-image default.
- Never promise safety, sender authentication or measured accuracy without evidence. Clearly label demonstration posts and unavailable/stale feeds.
- Keep secrets server-side and outside Git. Include only blank/safe environment examples. Do not distribute `.local` exports containing development tokens.
- Record permissions and attribution for added assets, libraries and data. RSS access approval does not authorize scraping the entire publisher website.
- Do not add arbitrary URL fetching, network probing or campus-system testing. Use synthetic cases and authorized endpoints.
- Run backend regressions for backend changes, browser regressions for affected UI, and lint/typecheck for every code change. Device-only features need physical-device checks; exports alone do not establish device behavior.

## Final source release gate

- [ ] Confirm team/asset provenance, intended project licensing and attribution. Retain original upstream notices; do not replace Expo's attribution with the team name.
- [ ] Review `git status` and the actual staged diff. Include all app/backend source, assets, package lockfile, README, notices, tests, scripts, configuration and `server/.env.example`.
- [ ] Exclude actual `.env` variants, credentials, private screenshots/messages, `.local`, `node_modules`, generated native folders and local exports. Check the complete Git history before publication, not only the current files.
- [x] Commit the complete MVP on `master` and push to `AbdelfattahGamalSayed/T2AKKAD`. Recheck the final submitted commit after any later changes.
- [ ] Verify reviewer access. The supplied terms require GitHub but do not state public visibility; confirm access expectations with the organizer.
- [ ] Clone that repository into a separate clean directory; run `npm ci`, configure a private key, and verify the documented startup. No local-only file should be needed beyond private credentials and launcher-generated state.
- [ ] Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run test:ui`, and the documented bundle export. Use synthetic demo content and verify the final iPhone flow.
- [ ] Document unresolved issues, dataset/evaluation limitations and third-party dependencies. Do not claim production readiness or benchmark accuracy.
- [ ] Coordinate the separate technical documentation and PPT, submit the repository link in the official submission app before the confirmed deadline, and keep a receipt/backup and commit ID.

## Audited limitations

The current AI model is externally hosted and not trained by the team. The alerts integration covers one official UAE publisher, not comprehensive threat intelligence. Community is fictional and has no login/posting. Notifications and widgets are not implemented. The LAN server/token setup is for development, not a production identity/security system. These are disclosed scope decisions; the supplied terms do not require these optional features.

The source audit cannot establish when every contribution was created or certify all participant/asset rights. Do not mark these checks complete without evidence from the team. Prior successful automated checks and iPhone confirmations are useful evidence, but the final submitted commit must be verified again.

## GitHub verification on 2026-11-21

Repository created private; default branch is `master`. Source commit `7ece35895f3006174889e6fd6b768bf3fc95ae17` was cloned from GitHub into a separate verification directory. `npm ci`, all 51 backend tests, typecheck, lint and all 16 mocked browser tests passed. GitHub Actions also passed backend tests, typecheck and lint. The browser tests exercised launcher startup without copying private credentials. No new real-provider or physical-device test was performed in this GitHub setup step.

Before the first push, the exact staged contents were checked for private environment/cache paths, the local OpenAI key, the local pairing token and common credential patterns; no matches were found. Only the blank environment example was committed. Reviewer access and competition submission remain outstanding.
