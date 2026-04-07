# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common commands

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
npm run test:ci
```

Test notes:

- `npm run test` runs Jest in watch mode.
- For non-interactive runs, use `npm run test:ci`.
- Run a single test file with `npm run test:ci -- --runTestsByPath src/app/components/Resume/auto-fit.test.ts`.
- Run tests matching a name with `npm run test:ci -- -t "auto fit"`.

Docker:

```bash
docker build -t open-resume .
docker run -p 3000:3000 open-resume
```

## High-level architecture

This is a Next.js 13 App Router app with almost all product code under `src/app`. The app has three main product flows:

- `src/app/resume-builder/page.tsx`: interactive resume builder
- `src/app/resume-import/page.tsx`: import an existing PDF into builder state
- `src/app/resume-parser/page.tsx`: parser playground and algorithm walkthrough

TypeScript uses `baseUrl: src/app`, so imports are intentionally absolute like `components/...` and `lib/...`. `public/*` is also path-mapped in `tsconfig.json`.

## Resume builder data flow

The builder is a client-side experience because it depends on Redux, `localStorage`, browser PDF APIs, and dynamic preview rendering.

- `src/app/lib/redux/store.ts` defines two top-level slices: `resume` and `settings`.
- `src/app/lib/redux/resumeSlice.ts` holds the editable resume content: profile, work experience, education, projects, skills, and custom section.
- `src/app/lib/redux/settingsSlice.ts` holds presentation/config state: theme color, font family/size, document size, section visibility, section headings, section ordering, bullet toggles, and auto-fit.
- `src/app/lib/redux/hooks.tsx` hydrates Redux from browser storage on load and persists changes back to local storage.
- `src/app/lib/redux/local-storage.ts` uses the key `open-resume-state`.

When changing resume schema or settings shape, update the slice types, selectors/actions, the form components, and the PDF rendering path together. Hydration merges stored state with current defaults, so persisted-state compatibility matters.

## Builder UI and preview coupling

The builder page composes two live halves:

- `src/app/components/ResumeForm/index.tsx`: editable form UI
- `src/app/components/Resume/index.tsx`: live preview and download controls

`ResumeForm` renders section forms in the order stored in `settings.formsOrder`, while `ResumePDF` renders sections in that same order after filtering by `settings.formToShow`. If you change section ordering, visibility, headings, or bullet behavior, verify both form and PDF output paths.

## PDF rendering model

The preview and downloadable PDF share the same document component:

- `src/app/components/Resume/ResumePDF/index.tsx`

Important details:

- The app uses `@react-pdf/renderer`, not DOM/CSS layout, for the resume document.
- The preview is rendered through `ResumeIFrameCSR`, while downloads use the same `ResumePDF` document instance.
- `ResumePDF` supports both preview and actual PDF output via the `isPDF` flag, and suppresses known react-pdf console noise in development.
- Layout values come from `src/app/components/Resume/ResumePDF/layout.ts`, which centralizes point-based typography/spacing tokens and the auto-fit scaling logic.
- Font registration and hyphenation are handled via `src/app/components/fonts/*`; be careful with multilingual font behavior and font asset changes.

## Auto-fit one-page flow

The one-page fit feature is not just a CSS toggle.

- `src/app/components/Resume/AutoFitProvider.tsx` watches resume/settings changes.
- It renders candidate `ResumePDF` documents in the browser with `@react-pdf/renderer`, measures the generated blob, and computes the best scale.
- `src/app/components/Resume/auto-fit.ts` searches for a viable scale.
- `src/app/components/Resume/ResumePDF/layout.ts` builds the effective layout tokens for both manual and auto-fit modes.
- `src/app/lib/get-pdf-page-count.ts` / related PDF metric utilities are part of this measurement path.

If you touch spacing, font sizing, or page metrics, check both manual rendering and auto-fit behavior.

## Resume import and parser pipeline

Both import and parser features ultimately depend on the same PDF extraction pipeline.

- `src/app/components/ResumeDropzone.tsx` handles local PDF selection.
- Import flow parses a PDF, converts it into resume state, writes that state to local storage, and redirects to `/resume-builder`.
- `src/app/lib/parse-resume-from-pdf/index.ts` is the top-level parser pipeline:
  1. `read-pdf.ts`
  2. `group-text-items-into-lines.ts`
  3. `group-lines-into-sections.ts`
  4. `extract-resume-from-sections/*`

Parser heuristics are tuned for single-column English resumes. The parser playground in `src/app/resume-parser/page.tsx` exposes intermediate outputs and sample PDFs, so it is the best manual validation path for parser changes.

## Build and runtime gotchas

- `next.config.js` sets `output: "standalone"` for deploy/container output.
- `next.config.js` aliases `canvas` and `encoding` to `false` to avoid `pdfjs-dist` build failures. Do not remove this without revalidating builds.
- `src/app/lib/parse-resume-from-pdf/read-pdf.ts` wires up the `pdfjs-dist` worker manually; parser/import code depends on that setup.
- Many builder/parser components require `"use client"`; avoid moving browser-dependent code into server contexts.

## Useful validation paths

After non-trivial changes, prefer the smallest relevant checks:

```bash
npm run lint
npm run test:ci
npm run build
```

Manual smoke tests by route:

- `/resume-builder` for form/preview/download/state persistence work
- `/resume-import` for PDF import into builder state
- `/resume-parser` for parser heuristics and sample PDF behavior
