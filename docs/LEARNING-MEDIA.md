# Learning guides and media provenance

Updated 24 November 2026. Four Arabic/English illustrated guides cover verification codes/account approvals, payments, impersonation and suspicious links. Each uses three steps with Back/Next.

## Active videos

At the user's express request, the application and public repository include exact copies of their two supplied MP4s:

| Repository file | Original source filename | Format |
| --- | --- | --- |
| `assets/learning/UnknownCallerVideo.mp4` | `UnkownCallerVideo.mp4` | 30 seconds, 960×540, H.264 video / AAC audio |
| `assets/learning/UnknownLinkVideo.mp4` | `UnknownLinkVideo.mp4` | 30 seconds, 960×540, H.264 video / AAC audio |

The source files remain in Downloads unchanged. SHA-256 hashes in `assets/learning/media.json` match the original files, and a regression check verifies the repository copies. The caller filename alone was corrected. No transcoding, new soundtrack or generated replacement was applied.

The caller example concerns a caller claiming to represent a government department and asking for a UAE PASS approval. The link example concerns a purported bank warning and a suspicious link. They are illustrative scenarios, not official police training, real account verification or proof that the app can guarantee sender identity. The caller clip accompanies the code/account guide; the link clip accompanies the suspicious-link guide. Payment and impersonation guides remain available as written/illustrated guidance.

The videos contain English on-screen content and original audio. Both Arabic and English interfaces label them as English videos, with related safety tips in the selected language. The tips are not claimed to be verbatim captions or translated video tracks. No Arabic dub, new TTS or voice-cloning feature is added. This app-media change is separate from the competition's required non-AI-generated, recorded one-minute submission demo.

## Rights and playback

The uploader identified these as videos they made and explicitly authorized app and public-repository inclusion. Copyright remains with the relevant rights holders. No separate blanket MIT relicensing grant was supplied for these MP4s; see `assets/learning/LICENSE.txt`. The team must confirm any third-party marks, footage and audio rights before final submission. Do not imply official endorsement. The old generated silent clips and their generator have been removed from the active source; the former asset-specific MIT notice does not cover the new videos.

Playback uses SDK 58's `expo-video` (MIT). The files are bundled locally with a 16:9 view, original audio enabled, Play/Pause and native seek controls. They do not autoplay or loop, pause when leaving Learn, and disable background playback and picture-in-picture. Written safety tips remain available if playback fails. Browser tests verify both files in each interface language, dimensions, duration, audio-unmuted state and pause-on-leave behavior. Physical-phone sound, seek and interruption behavior still need device checks.

Topic filters remain optional and local. All topics stays available, and the preference is not sent to the backend for profiling. The official-alert source restrictions are unchanged.
