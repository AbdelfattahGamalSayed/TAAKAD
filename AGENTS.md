This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Hackathon requirements for every change

Read `SUBMISSION-CHECKLIST.md` before changing submission behavior or scope. It records the terms supplied by the user on 2026-11-21; do not invent additional competition requirements.

- Keep the complete reproducible MVP and README on `master` for submission. Never publish credentials, personal messages/screenshots, `.local` data, or development tokens. Include `.env.example` and the dependency lockfile.
- Keep README problem/solution, architecture, model choice, privacy flow, run instructions, trade-offs and known omissions consistent with actual behavior.
- Preserve explicit consent before external AI processing, server-only API secrets, and honest uncertainty. Never automatically visit submitted URLs or probe third-party/campus systems.
- Keep fictional community data and unfinished features clearly labelled. Never imply police endorsement, verified sender identity, guaranteed safety, or measured accuracy without evidence.
- Review provenance, licensing, attribution and source permissions when adding code, assets, datasets or feeds. Preserve third-party notices. UAE alerts stay restricted to approved official feeds; no social media or commercial news outlets.
- Use synthetic test content. Run appropriate regression tests plus lint/typecheck; record device-testing limits honestly.
- GitHub publication, submission delivery, team registration/eligibility, ownership confirmations and deadline verification must remain explicit outstanding items until verified. Do not mark the entry fully compliant from local tests alone.
- The user has excluded PowerPoint and the separate report from the current task. Do not modify unrelated Maranee projects.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
