# Resume Desk

Resume Desk is a local-first resume workspace built with Next.js 13.

This project is an original adaptation inspired by [OpenResume](https://open-resume.com).

This repository lets users:

- create and manage multiple resume drafts in the browser
- edit resumes with a live PDF preview
- export polished PDF resumes
- import an existing resume PDF into editable builder state

The codebase still contains the PDF parsing pipeline used for resume import, and the parser route currently renders a disabled placeholder rather than the older parser playground UI.

## What The App Looks Like Today

The current app is centered around a resume dashboard instead of a marketing landing page.

- `/` shows the local resume manager
- `/resume-builder` opens the editor and live preview
- `/resume-import` imports a PDF into local resume state
- `/resume-parser` is currently a disabled page shell

The app is browser-first and local-first:

- drafts are stored in `localStorage`
- no sign-in is required
- export happens entirely in the browser
- UI copy supports English and Simplified Chinese

## Tech Stack

- Next.js 13 App Router
- React 18
- TypeScript with `strict: true`
- Tailwind CSS
- Redux Toolkit
- `@react-pdf/renderer` for preview and export
- `pdfjs-dist` / PDF.js for PDF extraction and parsing
- Jest + Testing Library

## Getting Started

### npm

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker

```bash
docker build -t resume-desk .
docker run -p 3000:3000 resume-desk
```

## Available Scripts

- `npm run dev`: start the local dev server on port 3000
- `npm run build`: production build
- `npm run start`: run the production server after building
- `npm run lint`: run Next.js linting
- `npm run test:ci`: run Jest once in CI mode
- `npm run test`: run Jest in watch mode

Useful one-off test examples:

```bash
npm run test:ci -- --runTestsByPath src/app/components/Resume/auto-fit.test.ts
npm run test:ci -- -t "auto fit"
```

## Project Structure

Most product code lives under `src/app`.

```text
src/app
├── page.tsx                          # resume manager dashboard
├── resume-builder/page.tsx           # builder + live preview
├── resume-import/page.tsx            # PDF import flow
├── resume-parser/page.tsx            # parser placeholder page
├── components/ResumeForm             # editable resume form
├── components/Resume                 # preview shell, controls, auto-fit
├── components/Resume/ResumePDF       # PDF document components
├── components/ResumeManager          # dashboard for saved drafts
├── components/fonts                  # font registration and fallbacks
├── lib/redux                         # store, slices, persistence helpers
└── lib/parse-resume-from-pdf         # parser pipeline and extraction heuristics
```

`tsconfig.json` uses `baseUrl: src/app`, so imports are intentionally absolute:

```ts
import { ResumeForm } from "components/ResumeForm";
import { store } from "lib/redux/store";
```

## Core Architecture

### 1. Resume manager and persistence

The app stores resume data locally and supports multiple saved drafts.

The current implementation still uses legacy storage keys inherited from the OpenResume-based foundation:

- current builder snapshot: `open-resume-state`
- dashboard resume library: `open-resume-manager`
- UI preferences: `open-resume-preferences`

Main files:

- `src/app/components/ResumeManager/index.tsx`
- `src/app/lib/redux/local-storage.ts`
- `src/app/lib/preferences.ts`

### 2. Builder and preview stay in sync

The builder is a client-side experience because it depends on Redux, `localStorage`, browser PDF APIs, and DOM measurement.

- `src/app/resume-builder/page.tsx` wires the Redux `Provider`
- `src/app/components/ResumeForm/index.tsx` renders the editable sections
- `src/app/components/Resume/index.tsx` renders the preview and controls
- `src/app/lib/redux/resumeSlice.ts` stores resume content
- `src/app/lib/redux/settingsSlice.ts` stores layout and display settings

If you change the resume schema or section settings, update the form, Redux slices, and PDF consumers together.

### 3. PDF rendering and auto-fit

Preview and export both use `@react-pdf/renderer`, not DOM-to-PDF conversion.

- `src/app/components/Resume/ResumePDF/index.tsx` is the shared PDF document
- `src/app/components/Resume/ResumePDF/layout.ts` defines layout tokens and scaling
- `src/app/components/Resume/AutoFitProvider.tsx` calculates a layout that fits the resume
- `src/app/components/Resume/create-resume-pdf.tsx` creates downloadable blobs

This means spacing, font sizes, and layout changes should be validated in both preview and download flows.

### 4. PDF import and parsing

The import flow relies on the parser pipeline under `src/app/lib/parse-resume-from-pdf`.

Pipeline overview:

1. `read-pdf.ts`
2. `group-text-items-into-lines.ts`
3. `group-lines-into-sections.ts`
4. `extract-resume-from-sections/*`

The parser still powers resume import, even though the `/resume-parser` route is currently not exposing the previous interactive parser UI.

## Routes

| Route | Purpose | Main entry |
| --- | --- | --- |
| `/` | Resume dashboard and saved drafts | `src/app/page.tsx` |
| `/resume-builder` | Resume editor and live preview | `src/app/resume-builder/page.tsx` |
| `/resume-import` | Import an existing PDF into builder state | `src/app/resume-import/page.tsx` |
| `/resume-parser` | Disabled parser placeholder page | `src/app/resume-parser/page.tsx` |
| `/resumes` | Redirects back to `/` | `src/app/resumes/page.tsx` |

## Development Notes

- Keep the existing absolute import style from `src/app`
- Add `"use client";` only where browser APIs are actually required
- When changing persisted state shape, preserve compatibility with existing saved drafts
- Font behavior matters for multilingual resumes, especially for Chinese font fallbacks
- `next.config.js` aliases `canvas` and `encoding` to `false` to avoid `pdfjs-dist` build issues
- The app is built with `output: "standalone"` for containerized deployment

## Validation Checklist

After non-trivial changes, run the smallest relevant set:

```bash
npm run lint
npm run test:ci
npm run build
```

Manual smoke tests by route:

1. `/` for resume dashboard behavior
2. `/resume-builder` for form, preview, and download behavior
3. `/resume-import` for PDF import
4. `/resume-parser` only if you touched parser-related copy or routing behavior

When changing builder or PDF code, verify:

- form edits update the preview
- PDF export still works
- no console errors appear in the browser

When changing parser logic, verify:

- sample PDFs still load
- extracted sections remain reasonable
- targeted Jest coverage reflects the heuristic change

## Contributing Guidance

- Prefer focused updates over broad refactors
- Reuse existing utilities and components when possible
- If a change touches both form inputs and PDF output, review both paths before finishing
- If you add a dependency, explain why the current stack was not enough

## License

This project is licensed under the terms of the [LICENSE](LICENSE) file.
