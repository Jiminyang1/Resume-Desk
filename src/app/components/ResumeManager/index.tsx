"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "components/AppPreferencesProvider";
import {
  ArrowUpTrayIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  createNewResumeInLocalStorage,
  deleteResumeFromLocalStorage,
  loadResumeManagerFromLocalStorage,
  openResumeInLocalStorage,
  type ResumeManagerState,
  type SavedResume,
} from "lib/redux/local-storage";
import type { ShowForm } from "lib/redux/settingsSlice";
import type { ResumePreset } from "lib/resume-presets";
import { cx } from "lib/cx";

const defaultResumeManagerState: ResumeManagerState = {
  currentResumeId: null,
  resumes: [],
};

const toolbarSecondaryActionButtonClassName = "btn-secondary h-10 px-3 text-sm";
const secondaryActionButtonClassName = "btn-secondary h-8 px-2.5 text-xs";
const dangerActionButtonClassName = "btn-danger h-8 px-2.5 text-xs";

const formatDateTime = (value: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const hasText = (value: string) => value.trim().length > 0;

const hasDescriptions = (descriptions: string[]) =>
  descriptions.some((description) => hasText(description));

const getSectionCounts = (savedResume: SavedResume): Record<ShowForm, number> => ({
  workExperiences: savedResume.resume.workExperiences.filter(
    (entry) =>
      entry.visible !== false &&
      ([entry.company, entry.jobTitle, entry.date].some(hasText) ||
        hasDescriptions(entry.descriptions))
  ).length,
  educations: savedResume.resume.educations.filter(
    (entry) =>
      entry.visible !== false &&
      ([entry.school, entry.degree, entry.gpa, entry.date].some(hasText) ||
        hasDescriptions(entry.descriptions))
  ).length,
  projects: savedResume.resume.projects.filter(
    (entry) =>
      entry.visible !== false &&
      ([entry.project, entry.date].some(hasText) ||
        hasDescriptions(entry.descriptions))
  ).length,
  skills: savedResume.resume.skills.descriptions.filter(hasText).length,
  custom: savedResume.resume.custom.descriptions.filter(hasText).length,
});

const formatSectionCountLabel = (
  form: ShowForm,
  count: number,
  language: SavedResume["language"]
) => {
  if (language === "zh-CN") {
    if (form === "skills" || form === "custom") {
      return `${count} 条`;
    }
    return `${count} 段`;
  }

  const isLineBased = form === "skills" || form === "custom";
  const singular = isLineBased ? "line" : "entry";
  const plural = isLineBased ? "lines" : "entries";
  return `${count} ${count === 1 ? singular : plural}`;
};

const getOrderedSectionSummaries = (savedResume: SavedResume) => {
  const sectionCounts = getSectionCounts(savedResume);
  const sectionHasContent = {
    workExperiences: sectionCounts.workExperiences > 0,
    educations: sectionCounts.educations > 0,
    projects: sectionCounts.projects > 0,
    skills: sectionCounts.skills > 0,
    custom: sectionCounts.custom > 0,
  };

  const orderedVisibleForms = savedResume.settings.formsOrder.filter(
    (form) => savedResume.settings.formToShow[form]
  );
  const orderedFormsWithContent = orderedVisibleForms.filter(
    (form) => sectionHasContent[form]
  );
  const formsToDisplay =
    orderedFormsWithContent.length > 0
      ? orderedFormsWithContent
      : orderedVisibleForms;

  return formsToDisplay
    .map((form) => {
      const heading = savedResume.settings.formToHeading[form].trim();
      if (!heading) return undefined;

      return `${heading} ${formatSectionCountLabel(
        form,
        sectionCounts[form],
        savedResume.language
      )}`;
    })
    .filter((value): value is string => Boolean(value));
};

const MetaTag = ({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "active";
}) => (
  <span
    className={cx(
      "inline-flex items-center border px-2 py-1 text-[11px] font-medium uppercase tracking-[0.08em]",
      tone === "active"
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-300 bg-slate-100 text-slate-700"
    )}
  >
    {children}
  </span>
);

export const ResumeManager = () => {
  const copy = useTranslation();
  const router = useRouter();
  const [isNewResumePickerOpen, setIsNewResumePickerOpen] = useState(false);
  const [resumeManagerState, setResumeManagerState] = useState(
    defaultResumeManagerState
  );

  const refreshResumeManager = () => {
    setResumeManagerState(loadResumeManagerFromLocalStorage());
  };

  useEffect(() => {
    setResumeManagerState(loadResumeManagerFromLocalStorage());
  }, []);

  const summary = useMemo(() => {
    const resumes = resumeManagerState.resumes;
    const currentResume = resumes.find(
      (resume) => resume.id === resumeManagerState.currentResumeId
    );

    return {
      totalResumes: resumes.length,
      importedResumes: resumes.filter((resume) => resume.source === "imported")
        .length,
      draftLabel: currentResume?.title ?? copy.dashboard.noActiveDraft,
    };
  }, [copy.dashboard.noActiveDraft, resumeManagerState]);

  const onCreateResume = (preset: ResumePreset) => {
    createNewResumeInLocalStorage({ preset });
    setIsNewResumePickerOpen(false);
    router.push("/resume-builder");
  };

  const onOpenResume = (resumeId: string) => {
    openResumeInLocalStorage(resumeId);
    router.push("/resume-builder");
  };

  const onDeleteResume = async (savedResume: SavedResume) => {
    const shouldDelete = window.confirm(
      copy.dashboard.deleteConfirm(savedResume.title)
    );
    if (!shouldDelete) return;

    await deleteResumeFromLocalStorage(savedResume.id);
    refreshResumeManager();
  };

  const getResumeLanguageLabel = (language: SavedResume["language"]) =>
    language === "zh-CN"
      ? copy.dashboard.chineseResume
      : copy.dashboard.englishResume;

  return (
    <main className="min-h-[calc(100vh-var(--top-nav-bar-height))] px-4 py-6 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-4">
        <header className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            {copy.dashboard.eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">
            {copy.dashboard.title}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">
            {copy.dashboard.description}
          </p>
        </header>

        <section className="ui-panel p-3">
          <div className="flex flex-wrap items-stretch gap-2">
            <div className="relative">
              <button
                type="button"
                className="btn-primary h-10 px-3 text-sm"
                aria-expanded={isNewResumePickerOpen}
                aria-controls="new-resume-picker"
                onClick={() =>
                  setIsNewResumePickerOpen((current) => !current)
                }
              >
                <PlusIcon className="h-4 w-4" />
                {copy.dashboard.newResume}
              </button>
              {isNewResumePickerOpen && (
                <div
                  id="new-resume-picker"
                  className="absolute left-0 top-[calc(100%+0.5rem)] z-10 min-w-[240px] border border-slate-300 bg-white p-3"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    {copy.dashboard.chooseLanguage}
                  </p>
                  <div className="mt-3 grid gap-2">
                    <button
                      type="button"
                      className={toolbarSecondaryActionButtonClassName}
                      onClick={() => onCreateResume("chinese")}
                    >
                      {copy.dashboard.chineseResume}
                    </button>
                    <button
                      type="button"
                      className={toolbarSecondaryActionButtonClassName}
                      onClick={() => onCreateResume("english")}
                    >
                      {copy.dashboard.englishResume}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              className={toolbarSecondaryActionButtonClassName}
              onClick={() => router.push("/resume-import")}
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              {copy.dashboard.importPdf}
            </button>
          </div>
          <div className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-600">
            {copy.dashboard.savedResumeCount(summary.totalResumes)}
            <span className="mx-2 text-slate-300">/</span>
            {copy.dashboard.importedDrafts}: {summary.importedResumes}
            <span className="mx-2 text-slate-300">/</span>
            {copy.dashboard.currentDraft}: {summary.draftLabel}
          </div>
        </section>

        <section className="ui-panel">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                {copy.dashboard.libraryEyebrow}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">
                {copy.dashboard.libraryTitle}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {copy.dashboard.libraryDescription}
              </p>
            </div>
            <div className="text-sm text-slate-500">
              {resumeManagerState.resumes.length === 0
                ? copy.dashboard.noResumesTitle
                : copy.dashboard.savedResumeCount(resumeManagerState.resumes.length)}
            </div>
          </div>

          {resumeManagerState.resumes.length === 0 ? (
            <div className="p-6">
              <p className="text-base font-semibold text-slate-900">
                {copy.dashboard.noResumesTitle}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                {copy.dashboard.noResumesDescription}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {resumeManagerState.resumes.map((savedResume) => {
                const isCurrent =
                  savedResume.id === resumeManagerState.currentResumeId;
                const orderedSectionHeadings = getOrderedSectionSummaries(savedResume);

                return (
                  <article
                    key={savedResume.id}
                    className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-slate-950">
                          {savedResume.title}
                        </h3>
                        {isCurrent && (
                          <MetaTag tone="active">
                            {copy.dashboard.currentDraft}
                          </MetaTag>
                        )}
                        <MetaTag>{getResumeLanguageLabel(savedResume.language)}</MetaTag>
                      </div>
                      {orderedSectionHeadings.length > 0 && (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {orderedSectionHeadings.join(" / ")}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-3 md:min-w-[11rem] md:self-stretch">
                      <div className="flex flex-row items-start gap-2 md:flex-col md:items-stretch">
                        <button
                          type="button"
                          className="btn-primary h-8 px-2.5 text-xs"
                          onClick={() => onOpenResume(savedResume.id)}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          {copy.dashboard.openResume}
                        </button>
                        <button
                          type="button"
                          className={dangerActionButtonClassName}
                          onClick={() => onDeleteResume(savedResume)}
                        >
                          <TrashIcon className="h-4 w-4" />
                          {copy.dashboard.deleteResume}
                        </button>
                      </div>
                      <p className="text-right text-xs text-slate-500 md:mt-auto">
                        {copy.common.updated} {formatDateTime(savedResume.updatedAt)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <footer className="pt-1 text-right text-xs text-slate-400">
          Built on{" "}
          <Link
            href="https://github.com/xitanggg/open-resume"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-slate-600"
          >
            OpenResume
          </Link>
          .
        </footer>
      </section>
    </main>
  );
};
