"use client";

import { useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import {
  useTranslation,
} from "components/AppPreferencesProvider";
import { createResumePdfBlob } from "components/Resume/create-resume-pdf";
import {
  getManualResumeLayout,
  resolveAutoFitLayout,
} from "components/Resume/resolve-auto-fit-layout";
import {
  useRegisterReactPDFFont,
  useRegisterReactPDFHyphenationCallback,
} from "components/fonts/hooks";
import { cx } from "lib/cx";
import { useProfilePhotoDataUrl } from "lib/hooks/useProfilePhotoDataUrl";
import { getProfilePhotoAsset } from "lib/profile-photo-storage";
import type { SavedResume } from "lib/redux/local-storage";

const getDownloadFileName = (savedResume: SavedResume) => {
  const fileName = savedResume.resume.profile.name.trim() || savedResume.title;
  return `${fileName || "Resume"} - Resume.pdf`;
};

const getResumeLayoutForDownload = async ({
  savedResume,
  profilePhotoDataUrl,
}: {
  savedResume: SavedResume;
  profilePhotoDataUrl?: string | null;
}) => {
  const { resume, settings } = savedResume;

  try {
    const { layout } = await resolveAutoFitLayout({
      resume,
      settings,
      profilePhotoDataUrl,
    });

    return layout;
  } catch (error) {
    console.error("Failed to auto-fit resume before download", error);
    return getManualResumeLayout(settings);
  }
};

export type ResumeManagerDownloadButtonProps = {
  savedResume: SavedResume;
  className?: string;
};

export const ResumeManagerDownloadButton = ({
  savedResume,
  className,
}: ResumeManagerDownloadButtonProps) => {
  const copy = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const profilePhotoDataUrl = useProfilePhotoDataUrl(
    savedResume.resume.profile.photoAssetId
  );

  useRegisterReactPDFFont();
  useRegisterReactPDFHyphenationCallback();

  const onDownload = async () => {
    try {
      setIsDownloading(true);
      const resolvedProfilePhotoDataUrl =
        profilePhotoDataUrl ||
        (
          await getProfilePhotoAsset(savedResume.resume.profile.photoAssetId)
        )?.dataUrl ||
        null;
      const layout = await getResumeLayoutForDownload({
        savedResume,
        profilePhotoDataUrl: resolvedProfilePhotoDataUrl,
      });
      const blob = await createResumePdfBlob({
        resume: savedResume.resume,
        settings: savedResume.settings,
        layout,
        profilePhotoDataUrl: resolvedProfilePhotoDataUrl,
      });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = getDownloadFileName(savedResume);
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
    <button
      type="button"
      className={cx(
        "btn-secondary h-10 px-3 text-sm",
        className
      )}
      onClick={onDownload}
      disabled={isDownloading}
    >
      <ArrowDownTrayIcon className="h-4 w-4" />
      {isDownloading ? `${copy.common.loading}` : copy.preview.downloadResume}
    </button>
  );
};
