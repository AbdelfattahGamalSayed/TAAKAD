# TAAKAD committee demo

## Recommended committee route: browser QR

From the project folder, run:

```powershell
npm.cmd run demo
```

This starts the backend and app server, or reuses this checkout's healthy running session, then opens a **browser QR**. Scan it with the phone's Camera and open it in **Safari or Chrome**. No Expo account, Expo Go installation or app sign-in is required to use the public features. Posting still requires the clearly labelled demo sign-in.

The phone and computer must use the same trusted Wi-Fi with device-to-device traffic allowed. Keep the computer awake and the original server terminal open. The QR uses the computer's current LAN address; rerun the command after changing networks. It is not an internet-hosted link. Select a photo once, optionally crop it in the local preview, then tap Scan photo. Browser and native apps share this flow; no crop means the whole photo. Selecting/cropping alone does not send it to OpenAI.

The generated QR page and image are `.local/browser-demo.html` and `.local/browser-demo.png`. Do not use the old Expo preview QR for the committee. If multiple network adapters are present, set `TAAKAD_DEMO_HOST` to this computer's reachable IPv4 address before running the command. Never put secrets in that variable or QR.

## Why the old Expo QR failed

The QR from `npm start` opens a **development server**. Current physical iOS Expo Go requires the same account in the CLI and Expo Go for this route. Signing out of the CLI or using a tunnel does not remove that requirement.

A **published Expo Update preview** is also account-restricted. Expo's May 2026 policy permits loading EAS Update projects only when the signed-in user owns the project or belongs to the owning organisation. The separate statement that published updates are unaffected by the development-server account check does not remove this membership requirement. The user's signed-out iPhone test returned HTTP 403. This QR is not a valid account-free committee route.

For a no-Expo-login demonstration, use the browser version, or distribute a separately signed native app through TestFlight. Do not share the author's credentials. An anonymously downloadable manifest does not prove permission to open the project in Expo Go.

Official sources, reviewed 24 November 2026:

- https://expo.dev/changelog/expo-go-loading-changes-may-2026
- https://docs.expo.dev/troubleshooting/expo-go-sign-in-required/
- https://docs.expo.dev/versions/v58.0.0/sdk/updates/
- https://docs.expo.dev/more/qr-codes/

## Before presenting

1. Run `npm.cmd run demo` on Windows (`npm run demo` elsewhere) and scan the browser QR with Camera. Use Safari or Chrome, not Expo Go.
2. Confirm the welcome screen opens, continue as guest, and try a synthetic screenshot, a Learn guide/video and Community. `npm.cmd run review` remains available for localhost browser review on the computer.
3. Keep the server terminal and computer running. Run `npm run check:demo` in a second terminal to check backend/proxy and Community pairing.
4. Optionally run `npm run check:demo -- --live` for one real synthetic AI assessment, which may incur a small charge.
5. Use synthetic content and do not place test calls to official or emergency services. Test the chosen demo route on a physical phone before the committee arrives.

`npm run demo` now opens the browser QR by default. An account member can explicitly opt into the separately configured restricted Expo preview with `npm run demo -- --expo-go-member`; it is not the account-free committee route.

## Preview publishing

Publishing is optional, account-restricted and separate from running the source. Reviewers can use their own accounts for development or the account-free browser preview (`npm run review`). The normal app configuration has no fixed author or Expo project binding.

The maintainer's local `.local/preview-settings.json` contains these deployment settings:

```json
{
  "projectId": "your-own-Expo-project-UUID",
  "owner": "your-Expo-account",
  "apiUrl": "http://YOUR-COMPUTER-LAN-IP:8081"
}
```

Create/link an Expo project using your own account and create a `committee` channel pointing at its `committee` branch. The maintainer's configured preview already has that channel. For account-member testing only, with the backend running, use `npm run publish:preview`; the publisher injects these settings only into the published bundle and saves the committee QR locally. A separate signed app is not needed for an Expo Go preview compatible with SDK 58.

The published bundle contains its demo API origin and the same non-privileged pairing token used by this local backend. It never contains the OpenAI key or moderator/support tokens. Use the trusted event network and synthetic examples. This is not a hosted production backend: outside this Wi-Fi, the preview's server features cannot reach the laptop. In-app learning clips are bundled with the preview.

When changing network/IP, regenerating local pairing state or changing app code, update local preview settings and republish. Keep the `committee` channel mapped to the right branch. Republishing on the same channel lets the same QR select its latest compatible update; reload Expo Go after a change. Do not publish `.local` or private environment files to GitHub.

## Distinguishing failures

- Backend not reachable: start `npm start`, check the trusted network and current QR, and run the preflight.
- `API_QUOTA`: the provider reported exhausted API credit; billing must be restored by the account owner.
- `API_LIMIT`: temporary provider rate limiting; wait before retrying.
- `API_AUTH_ERROR` or `API_MODEL_ERROR`: check the private key permissions and configured model.
- `AI_TIMEOUT`: the check exceeded its deadline. The app stops loading and allows another attempt.
- A single tap now automatically retries recoverable model/network errors within one 42-second backend budget (at most three attempts). Billing, authentication, consent errors and explicit refusals are not retried. A valid inconclusive result is not retried to force a score. The terminal logs only sanitized stage/error/retry metadata if recovery is needed.
- `UNAUTHORIZED`: an old bundle may have a different pairing token; reload from the current published QR or republish after replacing local state.

On 24 November 2026 a live provider request and synthetic screenshot extraction succeeded; the latter completed in about 1.2 seconds. The user confirmed that the earlier errors cleared after restarting the combined server. This establishes a working session, not a promise of provider availability during the event.

## Starting twice

`npm start` and `npm run demo` check both local ports and this checkout's pairing before starting children. A healthy matching app is reused without launching another server. A partial or different session produces clear instructions; no existing process is killed. If the launcher started the servers, keep that terminal open and use Ctrl+C to stop them. If it reused them, keep the original server terminal open. Direct backend startup also reports an occupied port without an unhandled Node stack trace.

## Confirmed access failure on 24 November 2026

The signed-out iPhone returned HTTP 403 requiring account membership. The initial anonymous-manifest HTTP 200 check was insufficient: project-loading authorisation is separate. The launcher and this guide were corrected, and no successful signed-out Expo Go test is claimed.

## Browser route validation on 24 November 2026

All 82 backend/helper tests, typecheck and lint passed. The browser demo command reused the running matching session, validated the LAN app/API address and generated an HTTP browser QR. A fresh Chrome session at the actual LAN origin opened guest Check without Expo credentials. A live synthetic screenshot reached extraction, context and AI results; separate Learn guide/video playback and guest Community API checks passed. These desktop checks do not establish physical iPhone/Safari behavior or event Wi-Fi connectivity; verify those before presenting.

The user subsequently confirmed browser startup and the new physical-phone crop flow work. Learn now plays the team's two supplied 30-second English MP4s with original audio, plus written Arabic/English safety tips. Check phone volume and test both clips before presenting. They do not autoplay and pause when leaving Learn.
