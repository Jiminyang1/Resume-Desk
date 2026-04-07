# AGENTS.md

This repository is `open-resume`, a Next.js 13 app for:

- building resumes in the browser
- rendering downloadable resume PDFs
- parsing existing resume PDFs to evaluate ATS readability

Use this file as the project-specific operating guide for coding agents and collaborators.

## Quick Start

```bash
npm install
npm run dev
```

Useful commands:

- `npm run dev`: start local development server on port 3000
- `npm run build`: production build
- `npm run start`: run production server after build
- `npm run lint`: run Next.js linting
- `npm run test:ci`: run Jest once in CI mode
- `npm run test`: watch mode, useful locally but not for automated verification

Docker is also supported:

```bash
docker build -t open-resume .
docker run -p 3000:3000 open-resume
```

## Stack

- Next.js 13 App Router
- React 18
- TypeScript with `strict: true`
- Tailwind CSS
- Redux Toolkit
- `@react-pdf/renderer` for PDF generation
- `pdfjs-dist` / PDF.js for resume parsing
- Jest + Testing Library

## Source Map

Top-level source lives under `src/app`, with absolute imports enabled from that directory via `tsconfig.json`.

Key routes:

- `src/app/page.tsx`: marketing home page
- `src/app/resume-import/page.tsx`: import an existing resume PDF
- `src/app/resume-builder/page.tsx`: main resume builder UI, wraps the page in the Redux `Provider`
- `src/app/resume-parser/page.tsx`: ATS parser experience and algorithm article

Key folders:

- `src/app/components/ResumeForm`: editable form for resume data
- `src/app/components/Resume`: live preview shell
- `src/app/components/Resume/ResumePDF`: PDF rendering components
- `src/app/lib/redux`: store, slices, hooks, types, local storage persistence
- `src/app/lib/parse-resume-from-pdf`: parser pipeline and extraction logic
- `src/app/components/fonts`: font-loading helpers for English and non-English fonts
- `public/fonts`: font assets used by the app
- `public/resume-example`: sample PDFs for manual testing

## Project Conventions

### Imports

- Prefer the existing absolute import style from `src/app`, for example `import { ResumeForm } from "components/ResumeForm";`
- `public/*` is also mapped in `tsconfig.json`
- Keep imports consistent with the current codebase instead of switching to long relative paths

### Client vs Server

- Many builder and parser experiences are client-side because they rely on Redux, `localStorage`, `navigator`, and PDF/browser APIs
- Add `"use client";` only where it is actually required
- Be careful when moving code across boundaries; browser-only code will break in server components

### Resume Builder Data Flow

- Resume state lives in Redux slices under `src/app/lib/redux`
- When changing resume data shape, update the relevant types, slice actions, selectors, and form/PDF consumers together
- The builder depends on the form and live preview staying in sync, so verify both after schema changes

### PDF Rendering

- PDF layout is implemented with `@react-pdf/renderer`, not DOM/CSS rendering
- `src/app/components/Resume/ResumePDF/styles.ts` defines a point-based spacing scale; keep units compatible with react-pdf
- Font behavior matters for multilingual resumes, so avoid removing or renaming registered font assets without checking the font-loading flow

### Resume Parsing

- Parser logic lives in `src/app/lib/parse-resume-from-pdf`
- Extraction heuristics are broken into focused modules such as profile, education, work experience, projects, and skills
- If you change parsing heuristics, add or update targeted Jest coverage close to the parser modules

### Persistence

- Redux state is persisted in browser local storage using the key `open-resume-state`
- Any change to persisted state shape should be made carefully to avoid breaking existing saved data

## Known Gotchas

- `next.config.js` aliases `canvas` and `encoding` to `false` to avoid `pdfjs-dist` build issues. Do not remove this without confirming production builds still work.
- The Next.js build is configured with `output: "standalone"` for containerized deployment.
- `npm run test` uses watch mode. For non-interactive validation, use `npm run test:ci`.
- The repo uses strict TypeScript but still contains some pragmatic casts in Redux reducers; preserve behavior unless you are deliberately tightening types.

## Recommended Validation

After non-trivial changes, run the smallest relevant set from below:

1. `npm run lint`
2. `npm run test:ci`
3. `npm run build`

For feature work, also do a manual smoke test of the affected route:

1. Home page: `/`
2. Import flow: `/resume-import`
3. Builder flow: `/resume-builder`
4. Parser flow: `/resume-parser`

When changing builder or PDF code, verify:

- form edits update the preview
- PDF still renders and downloads
- no console errors appear in the browser

When changing parser code, verify:

- sample PDFs can still be loaded
- extracted sections remain reasonable
- tests cover the heuristic you changed

## Editing Guidance For Agents

- Make focused changes and avoid broad refactors unless the task requires them
- Preserve the current folder structure and naming style
- Prefer updating existing utilities and components over introducing parallel abstractions
- If a change touches both the form schema and PDF output, review both halves before finishing
- If you add new dependencies, explain why the existing stack was insufficient

## Good First Places To Look

- New marketing/home page work: `src/app/page.tsx` and `src/app/home/*`
- Resume builder behavior: `src/app/components/ResumeForm/*`, `src/app/components/Resume/*`, `src/app/lib/redux/*`
- PDF layout/content: `src/app/components/Resume/ResumePDF/*`
- Parsing bugs: `src/app/lib/parse-resume-from-pdf/*`
