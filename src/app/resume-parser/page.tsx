"use client";

import { useTranslation } from "components/AppPreferencesProvider";

export default function ResumeParser() {
  const copy = useTranslation();

  return (
    <main className="min-h-[calc(100vh-var(--top-nav-bar-height))] px-4 py-6 lg:px-8 lg:py-8">
      <section className="mx-auto max-w-4xl border border-slate-300 bg-white p-6 lg:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          {copy.parser.eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">
          {copy.parser.disabledTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          {copy.parser.disabledDescription}
        </p>
      </section>
    </main>
  );
}
