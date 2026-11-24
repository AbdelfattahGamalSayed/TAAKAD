# TAAKAD competition submission

Completely rebuilt on 24 November 2026 around the kickoff judging rubric and the current app. App source baseline: `bb0a74d`. Submission branch: `master`. The current files below supersede the 23 November presentation/report.

## Project Title or Name

TAAKAD

## Project Team

Fatima Alhallak

Abdelfattah Sayed

Abdalrahman Moataz

## Brief Description

TAAKAD is an Arabic and English app that helps people spot scams in messages, links and screenshots. It uses AI to explain warning signs, show a 1–5 warning level and suggest a clear next step, with guided help for people who have already clicked or shared information. Official UAE awareness updates, short learning guides and consent-based community reports support safer decisions.

## Tools Used

TypeScript, JavaScript, React Native, Expo SDK 58, Expo Router, React Native Web, Node.js, OpenAI Responses API, GPT-4.1 mini, AsyncStorage, Playwright, GitHub Actions, Abu Dhabi Media Office RSS, Phishing.Database

## Repository URL

https://github.com/AbdelfattahGamalSayed/TAAKAD

Public access was verified without authentication on 24 November 2026.

## Presentation

Upload [TAAKAD_Judges_Presentation.pptx](TAAKAD_Judges_Presentation.pptx). The current 12-slide deck preserves the team's shortened slide order and adds a final slide with the supplied English and Arabic safety posters. It uses the app's current colors, both earlier storyboards and paired current English/Arabic UI screenshots on all eight screenshot-bearing slides. The architecture diagram and slide text remain editable. Source/context notes accompany the slides. The file is about 2.7 MB, below the 20 MB limit. The full judging rubric, evidence and proposed evaluation remain in the report.

Optional public presentation link:

https://github.com/AbdelfattahGamalSayed/TAAKAD/blob/master/submission/TAAKAD_Judges_Presentation.pptx

## Project Description Document

Upload [TAAKAD_Project_Report.docx](TAAKAD_Project_Report.docx). The 12-page report now has a full-page navy cover with white type, green/red accents and all three team names. The body retains black headings, paired bilingual UI examples, page numbers, readable paragraphs and comparison tables. It maps the five judging criteria to evidence, explains the current design and model choices, and documents privacy, feasibility, coverage and a proposed accuracy study. It is about 0.35 MB, below the 20 MB limit.

## Judging criteria

| Criterion supplied after kickoff | Weight |
| --- | ---: |
| Detection Accuracy | 30% |
| Early Detection and Coverage | 25% |
| Explainability and Actionability | 20% |
| UAE Relevance and Innovation | 15% |
| Feasibility and Presentation | 10% |

These are judging weights, not performance results. The 93 backend/helper tests and 78 browser tests verify behavior. No representative detection-accuracy percentage is claimed. The proposed 200-case bilingual study plus 40 ambiguous cases is explicitly future work.

## Demo Video

The team will record and upload the required one-minute demonstration and discussion. Use YouTube Unlisted or Google Drive shared as Anyone with the link. The competition prohibits an AI-generated submission demo video. The bundled in-app learning clips are not a substitute for this recording.

## Scope and provenance

Screenshots were captured from the working app using synthetic examples. Materials do not claim measured detection accuracy, real SMS verification, UAE PASS integration, an authority partnership or production security certification. Frameworks and pretrained models are attributed; AI coding assistance was used during development. Team membership, rights confirmations, final uploads and the submission receipt remain the team's responsibility.

UI result screenshots use real model responses to synthetic messages; different language examples may receive different ordinal levels. Supplied storyboards are illustrations, not proof of actual events or guaranteed safety. Source assets and their rights notice are in [assets/](assets/README.md).

## Editing and rebuilding the files

The app does not require Office. To rebuild these editable submission artifacts on Windows, install Microsoft Word/PowerPoint and Python 3, then use:

```powershell
# With the current app running and a private AI key configured:
node scripts/capture-submission.mjs
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-submission.ps1
python scripts/verify-submission.py --build .local/rubric-submission --normalize-metadata
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/render-submission-pdf.ps1 -PdfPath .local/rubric-submission/report.pdf -OutputDirectory .local/rubric-submission/report-pages
```

Content lives in [source/content.json](source/content.json). Capture uses only synthetic messages and makes two real text-assessment requests. Builds and QA PDFs/PNGs stay private under `.local/`. Inspect every rendered slide/page before copying the final PPTX and DOCX into `submission/`. Package validation checks all screenshot pairs, rubric weights, editability, team names, file size and basic document geometry; it does not replace visual/factual review.

To preserve further manual slide edits, pass `-SourcePresentation path/to/edited-draft.pptx` to the builder. That draft must omit the closing slide; the script appends it once, preserves the existing slides and refreshes their page numbers. The current content source also reflects the team's shortened order. See [simple launch instructions](../docs/DEMO.md#simple-steps-in-the-vs-code-terminal) for the separate browser and Expo Go QR routes.
