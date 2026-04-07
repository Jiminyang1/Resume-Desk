"use client";
import { useState, useRef } from "react";
import { useAutoFitContext } from "components/Resume/AutoFitContext";
import { createResumePdfBlob } from "components/Resume/create-resume-pdf";
import { ResumePreviewCSR } from "components/Resume/ResumePreview";
import { ResumeControlBarCSR } from "components/Resume/ResumeControlBar";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { useAppSelector } from "lib/redux/hooks";
import { selectResume } from "lib/redux/resumeSlice";
import { selectSettings } from "lib/redux/settingsSlice";
import { NonEnglishFontsCSSLazyLoader } from "components/fonts/NonEnglishFontsCSSLoader";
import { useProfilePhotoDataUrl } from "lib/hooks/useProfilePhotoDataUrl";

export const Resume = () => {
  const [scale, setScale] = useState(0.8);
  const [isDownloading, setIsDownloading] = useState(false);
  const resume = useAppSelector(selectResume);
  const settings = useAppSelector(selectSettings);
  const profilePhotoDataUrl = useProfilePhotoDataUrl(resume.profile.photoAssetId);
  const { effectiveLayout, getLayoutForExport } = useAutoFitContext();
  const previewContainerRef = useRef<HTMLElement>(null);

  const onDownload = async () => {
    try {
      setIsDownloading(true);
      const layout = await getLayoutForExport();
      const blob = await createResumePdfBlob({
        resume,
        settings,
        layout,
        profilePhotoDataUrl,
      });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = resume.profile.name.trim() || "Resume";

      link.href = downloadUrl;
      link.download = `${fileName} - Resume.pdf`;
      link.click();

      window.setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);
    } catch (error) {
      console.error("Failed to download resume", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <NonEnglishFontsCSSLazyLoader />
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-slate-200 px-4 py-3 lg:px-5">
          <ResumeControlBarCSR
            scale={scale}
            setScale={setScale}
            documentSize={settings.documentSize}
            onDownload={onDownload}
            isDownloading={isDownloading}
            previewContainerRef={previewContainerRef}
          />
        </div>
        <div className="relative flex min-h-0 flex-1 justify-center bg-stone-100 md:justify-start">
          <FlexboxSpacer maxWidth={20} className="hidden md:block" />
          <div className="flex min-h-0 flex-1 flex-col">
            <section
              ref={previewContainerRef}
              className="min-h-0 flex-1 overflow-auto p-4 lg:p-5"
            >
              <div className="flex min-h-full items-start justify-center">
                <ResumePreviewCSR
                  resume={resume}
                  settings={settings}
                  layout={effectiveLayout}
                  profilePhotoDataUrl={profilePhotoDataUrl}
                  scale={scale}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};
