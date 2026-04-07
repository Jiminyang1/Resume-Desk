"use client";
import { useTranslation } from "components/AppPreferencesProvider";
import { getHasUsedAppBefore } from "lib/redux/local-storage";
import { ResumeDropzone } from "components/ResumeDropzone";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ImportResume() {
  const copy = useTranslation();
  const [hasUsedAppBefore, setHasUsedAppBefore] = useState(false);
  const [hasAddedResume, setHasAddedResume] = useState(false);
  const onFileUrlChange = (fileUrl: string) => {
    setHasAddedResume(Boolean(fileUrl));
  };

  useEffect(() => {
    setHasUsedAppBefore(getHasUsedAppBefore());
  }, []);

  return (
    <main className="min-h-[calc(100vh-var(--top-nav-bar-height))] px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-3xl border border-slate-300 bg-white px-8 py-10 text-center lg:px-10">
        {!hasUsedAppBefore ? (
          <>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              {copy.importPage.eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950 lg:text-3xl">
              {copy.importPage.title}
            </h1>
            <ResumeDropzone
              onFileUrlChange={onFileUrlChange}
              className="mt-6 border-slate-300 bg-stone-50"
            />
            {!hasAddedResume && (
              <>
                <OrDivider />
                <SectionWithHeadingAndCreateButton
                  heading={copy.importPage.dontHaveResumeYet}
                  buttonText={copy.common.openDashboard}
                  href="/"
                />
              </>
            )}
          </>
        ) : (
          <>
            {!hasAddedResume && (
              <>
                <SectionWithHeadingAndCreateButton
                  heading={copy.importPage.savedDraftDetected}
                  buttonText={copy.common.openDashboard}
                  href="/"
                />
                <OrDivider />
              </>
            )}
            <h1 className="font-semibold text-slate-950">
              {copy.importPage.importAnother}
            </h1>
            <ResumeDropzone
              onFileUrlChange={onFileUrlChange}
              className="mt-5 border-slate-300 bg-stone-50"
            />
          </>
        )}
      </div>
    </main>
  );
}

const OrDivider = () => {
  const copy = useTranslation();

  return (
    <div className="mx-[-2.5rem] flex items-center pb-6 pt-8" aria-hidden="true">
      <div className="flex-grow border-t border-slate-200" />
      <span className="mx-2 mt-[-2px] flex-shrink text-lg text-slate-400">
        {copy.common.or}
      </span>
      <div className="flex-grow border-t border-slate-200" />
    </div>
  );
};

const SectionWithHeadingAndCreateButton = ({
  heading,
  buttonText,
  href,
}: {
  heading: string;
  buttonText: string;
  href: string;
}) => {
  return (
    <>
      <p className="font-semibold text-slate-900">{heading}</p>
      <div className="mt-5">
        <Link
          href={href}
          className="btn-primary"
        >
          {buttonText}
        </Link>
      </div>
    </>
  );
};
