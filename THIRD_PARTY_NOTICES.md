# Third-party components and provenance

TAAKAD includes third-party frameworks and uses an externally hosted pretrained model. These are not claimed as original team inventions. The repository's root LICENSE preserves the Expo template MIT notice. The team's project licensing and custom-asset ownership must be confirmed before release; ownership cannot be inferred from the template notice.

## Software dependencies

`package-lock.json` identifies exact resolved packages and their declared licenses. Install with `npm ci`; retain the upstream license/NOTICE files supplied with dependencies when redistributing them. Do not describe the entire dependency tree as MIT-only.

As reviewed from the lockfile on 2026-11-21, declared licenses include MIT, Apache-2.0, ISC, BSD variants, BlueOak-1.0.0, Python-2.0, CC-BY-4.0, MPL-2.0, Unlicense and dual-license alternatives. No lockfile package lacked license metadata. This metadata inventory does not substitute for reviewing applicable attribution, source-availability and redistribution obligations for the final shipped artifacts.

The direct runtime dependencies declare MIT licenses. Playwright and TypeScript declare Apache-2.0. Expo vector icons can contain upstream icon/font notices in addition to the wrapper's license; preserve those when bundling. The current UI uses Ionicons. Keep the existing Expo template asset provenance and verify any replacement images/logos before submission; no official police logo or endorsement should be implied.

## External services and official feeds

The added learning clips use original project-created geometric storyboards and text, with no downloaded footage or audio. See `docs/LEARNING-MEDIA.md` and `assets/learning/LICENSE.txt` for source, reproduction and scoped reuse permission. `expo-video` declares MIT licensing; its upstream license must accompany redistributed dependencies. No TTS or voice-cloning service is included.

OpenAI provides inference through its Responses API; no model weights are included in this source. A separate API account/key and available quota are required. Provider terms and data policies apply independently of source-code licenses.

Abu Dhabi Media Office feed titles and excerpts remain attributed to the publisher. See `ALERTS-SOURCES.md` for the RSS-specific permission basis and approved endpoints. Do not treat the publisher's entire website or content as MIT-licensed or broadly open for reuse.

## Phishing.Database

Public exact-hostname reputation feed: https://github.com/Phishing-Database/Phishing.Database

Downloaded in memory at runtime. Reports may be wrong or outdated. No match does not prove safety.

MIT License

Copyright (c) 2018-2025 Mitchell Krog - github.com/mitchellkrogza
Copyright (c) 2018-2025 Nissar Chababy - github.com/funilrys
Copyright (c) 2018-2025 Phishing.Database Contributors - github.com/Phishing-Database

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
