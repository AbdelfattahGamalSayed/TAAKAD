# TAAKAD: Trust Blue foundation

User-approved direction, implemented 2026-11-21. Applies to Expo SDK 58 / React Native 0.88. The visual foundation and plain-language copy are implemented; guided checking/recovery, demo sign-in and structured reports are implemented; real identity and authority workflows remain separate work.

## Direction

24 November update: the public name is **TAAKAD**. The user's latest direction replaces the all-blue treatment with strong, saturated colors while keeping the layout. Use deep green #087443 for the screenshot action, navy #0F1B3D for Paste Text, blue #1556BC for primary navigation/actions, red #C8102E for urgent help/error cues, and amber #F5A623 for caution symbols. Keep calm neutral surfaces so the strong accents remain clear. Dark mode uses solid action fills and readable foreground variants. Red/amber/green result symbols also have distinct shapes, labels and an ordinal score; a low score says Few warning signs, never guaranteed safe. Alert icons do not establish a measured threat level. The in-app brand mark combines the existing shield icon with an original red orbit, reflecting the user's reference without copying its raster artwork.

Home has two equal large tiles: Add a screenshot and Paste Text (also accepts links). Practice examples sit under More details. A short notice states that Scan photo sends the image to OpenAI. Photo selection opens a local preview; Crop photo edits that same image with a rectangle and corner handles. Whole-photo use remains the default, with a clear reset and button alternatives to dragging. Scan photo explicitly starts processing. Recovery entry: I already clicked something. Help me! Results show the first action, with remaining actions/evidence in More details. Shorten repetition without hiding consent, stale labels, demo boundaries or essential uncertainty. Existing internal storage keys and this historical design folder retain their old name to preserve preferences/references; the repository has been renamed TAAKAD.

Friendly, spacious, clearly labelled controls for the general public, especially older users. Use strong solid action colors and distinct status symbols rather than coloring every control blue. Preserve a separately designed dark theme. Avoid decorative complexity, icon-only primary actions and colour-only risk information.

The requested UI UX Pro Max skill was consulted: its Accessible & Ethical style, full RTL compatibility and React Native touch/accessibility guidance informed this system. Its generated sales/landing-page sections were not appropriate for a native safety utility and were not adopted. The team's supplied design direction takes precedence. No third-party raster artwork or new fonts were copied into the app.

## Source of truth

- `src/lib/theme.ts`: semantic text, primary, primarySoft, background, surface, input, border, risk and error colours for both themes.
- `src/components/ui.tsx`: text, cards, buttons, rows, brand, focus feedback and page width.
- `src/app/(tabs)/_layout.tsx`: labelled five-tab navigation, reversed order for Arabic, safe-area insets and horizontal accessibility overflow at large native font scales.

## Type and spacing

- Use native system fonts with native Arabic shaping; no unverified font fallback or external font request.
- Body text 17, secondary content 16, section titles 21, page titles 32. Eyebrows 14 and compact navigation labels 13 are the only small shared text styles.
- Allow system font scaling without a maximum multiplier. Text containers can grow; avoid fixed-height text boxes. Line height is at least 1.45 times text size.
- Page gutter 20; maximum readable content width 680. Card padding 20; section spacing 24; bottom content padding 48.
- Buttons at least 58 high; other shared touch controls at least 48 by 48. Keep visible text next to icons. Use the existing Ionicons family, with decorative glyphs hidden from screen readers.
- Selected controls use both semantic selected/checked state and a visible background. Preserve clear disabled and pressed states, plus a 3-unit focus outline.

## RTL and motion

Mirror row and tab order explicitly from locale; text alignment and writing direction follow language. URLs remain LTR. Arabic tracking is not artificially expanded. The startup animation waits for the reduced-motion preference and is omitted when reduction is requested; stack transitions are also disabled in that mode.

## Plain language and optional detail

Use short headings that name the task, familiar words and a concrete next action. Avoid API, server, hostname, feed and similar implementation vocabulary in the primary experience. Do not rewrite user-submitted messages, exact quoted evidence or attributed article excerpts. Results show next actions before additional evidence. Use the shared Details control for expanded explanations; it defaults closed, has an announced expanded state, supports keyboard activation and removes hidden content from reading order.

Never hide consent, the named external recipient, essential uncertainty, a reported-scam warning, old/unavailable alert labels or the fictional-community notice. Keep technical setup instructions in repository documentation or optional connection help, not error messages. Simplification must not imply safety, verified identity, official endorsement or guaranteed recovery.

## Guided Check journey

Use one stage at a time: choose (with an informed photo-processing notice), local photo preview/optional crop followed by Scan photo or pasted-text editing, optional context questions, and final consent. Clear photo readings skip mandatory text review; unclear readings need correction. The screenshot tile is the dominant entry; Paste Text also accepts links. Back preserves the draft and screenshot text. Changing the crop discards prior reading, answers and consent before rescanning. Questions have Yes, No, Not sure and Skip choices; they never authenticate a sender. Editing the message or sender resets answers and consent. Final confirmation uses a short preview with an Edit action for the complete text. Results retain warning level and next actions before optional evidence. Never reopen the image picker to crop a selected photo or bake the crop editor's dimming/grid into the saved image.

## Verification and limits

Welcome offers guest access as a primary action. Phone sign-in displays the demo limitation before inputs and on the code screen; UAE PASS stays disabled with an explanation. Use a single labelled six-digit field that supports paste/autofill, not six separate boxes. Show resend/expiry countdowns without announcing every second. Keep guest/cancel available during requests and preserve the in-memory Community draft. Never style a demo session as verified identity. All public features remain guest-accessible.

Recovery starts with a plain-language entry and asks five questions, one per screen. Show progress, Back, Yes/No/Not sure and Next. Prioritize money, then codes, passwords, and device guidance; combine payment/card actions. Keep help reachable before completion. Illustrated blocking/reporting panels are labelled as simplified, with text equivalents and no interactive-looking unlabeled controls. Preserve evidence before reporting, distinguish app reports from police reports, and never equate completion ticks with safety.

Automated checks cover semantic text contrast (at least 4.5:1 in light and dark), all five tabs in both languages/themes at 375px, 48-unit controls, keyboard focus, reduced-motion startup, tablet layouts and a browser 200% text stress test. The browser stress test approximates enlarged text; it is not a substitute for actual iOS Dynamic Type or VoiceOver testing.

Before final competition submission, check the five tabs on the user's iPhone with large system text and VoiceOver, and test Android TalkBack/device layout. Do not claim full accessibility certification from browser checks alone.
