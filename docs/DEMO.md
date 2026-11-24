# TAAKAD committee demo

## Two different QR codes

The QR from `npm start` opens a **development server**. Current physical iOS Expo Go requires the same account in the CLI and Expo Go for this route. Signing out of the CLI or using a tunnel does not remove that requirement.

A **published Expo Update preview** uses a different QR. Expo documents that the development-server account check does not apply to published updates. This is the committee route being tested, and does not require distributing the author's credentials. A physical signed-out iPhone confirmation is required before relying on it at the event.

Official sources, reviewed 24 November 2026:

- https://docs.expo.dev/troubleshooting/expo-go-sign-in-required/
- https://docs.expo.dev/versions/v58.0.0/sdk/updates/
- https://docs.expo.dev/more/qr-codes/

## Before presenting

1. Open the **TAAKAD** project folder and run `npm start`. This starts both the backend and Metro. Running `npx expo start` alone does not start the backend.
2. Keep that terminal and computer running. Connect the computer and demo phones to the same trusted Wi-Fi. Guest/client isolation or a changed LAN address can stop phone access.
3. In a second terminal run `npm run check:demo`. This checks backend reachability, the proxy and Community pairing. It does not make a paid model request.
4. Optionally run `npm run check:demo -- --live` to verify model access with a synthetic message. This makes one real API request and may incur a small charge.
5. Use `.local/committee-preview.png`, **not the development-server QR**, for the published preview. Scan with Camera and open in Expo Go. Test while signed out before the committee arrives.
6. Try a synthetic screenshot, recovery, a learning guide/video and a structured demo report. Use no real personal data and do not place test calls to official services.

## Preview publishing

Publishing is optional and separate from running the source. Reviewers can use their own accounts for development or the account-free browser preview (`npm run review`). The normal app configuration has no fixed author or Expo project binding.

The maintainer's local `.local/preview-settings.json` contains these deployment settings:

```json
{
  "projectId": "your-own-Expo-project-UUID",
  "owner": "your-Expo-account",
  "apiUrl": "http://YOUR-COMPUTER-LAN-IP:8081"
}
```

Create/link an Expo project using your own account and create a `committee` channel pointing at its `committee` branch. The maintainer's configured preview already has that channel. With the backend running, use `npm run publish:preview`; the publisher injects these settings only into the published bundle and saves the committee QR locally. A separate signed app is not needed for an Expo Go preview compatible with SDK 58.

The published bundle contains its demo API origin and the same non-privileged pairing token used by this local backend. It never contains the OpenAI key or moderator/support tokens. Use the trusted event network and synthetic examples. This is not a hosted production backend: outside this Wi-Fi, the preview's server features cannot reach the laptop. In-app learning clips are bundled with the preview.

When changing network/IP, regenerating local pairing state or changing app code, update local preview settings and republish. Keep the `committee` channel mapped to the right branch. Republishing on the same channel lets the same QR select its latest compatible update; reload Expo Go after a change. Do not publish `.local` or private environment files to GitHub.

## Distinguishing failures

- Backend not reachable: start `npm start`, check the trusted network and current QR, and run the preflight.
- `API_QUOTA`: the provider reported exhausted API credit; billing must be restored by the account owner.
- `API_LIMIT`: temporary provider rate limiting; wait before retrying.
- `API_AUTH_ERROR` or `API_MODEL_ERROR`: check the private key permissions and configured model.
- `AI_TIMEOUT`: the check exceeded its deadline. The app stops loading and allows another attempt.
- `UNAUTHORIZED`: an old bundle may have a different pairing token; reload from the current published QR or republish after replacing local state.

On 24 November 2026 a live provider request and synthetic screenshot extraction succeeded; the latter completed in about 1.2 seconds. The user confirmed that the earlier errors cleared after restarting the combined server. This establishes a working session, not a promise of provider availability during the event.
