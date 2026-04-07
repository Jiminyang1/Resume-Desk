import { createResumePdfBlob } from "components/Resume/create-resume-pdf";
import { buildResumeLayout } from "components/Resume/ResumePDF/layout";
import {
  findBestFitScale,
  getAutoFitScaleBounds,
  type AutoFitStatus,
} from "components/Resume/auto-fit";
import { getPdfPageCount } from "lib/get-pdf-page-count";
import type { Settings } from "lib/redux/settingsSlice";
import type { Resume } from "lib/redux/types";

export const getManualResumeLayout = (settings: Settings) =>
  buildResumeLayout({
    fontSize: settings.fontSize,
  });

export const resolveAutoFitLayout = async ({
  resume,
  settings,
  profilePhotoDataUrl,
  preferredScale,
}: {
  resume: Resume;
  settings: Settings;
  profilePhotoDataUrl?: string | null;
  preferredScale?: number | null;
}) => {
  const manualLayout = getManualResumeLayout(settings);

  if (!settings.autoFitOnePage) {
    return {
      layout: manualLayout,
      scale: manualLayout.fitScale,
      fitStatus: "disabled" as const,
    };
  }

  const pageCountByScale = new Map<number, Promise<number>>();
  const measurePageCount = async (fitScale: number) => {
    const normalizedScale = Math.round(fitScale * 1000) / 1000;
    const cachedPageCount = pageCountByScale.get(normalizedScale);
    if (cachedPageCount) return cachedPageCount;

    const pageCountPromise = (async () => {
      const candidateLayout = buildResumeLayout({
        fontSize: settings.fontSize,
        fitScale: normalizedScale,
        enforceAtsBoundaries: true,
      });
      const blob = await createResumePdfBlob({
        resume,
        settings,
        layout: candidateLayout,
        profilePhotoDataUrl,
      });
      return getPdfPageCount(blob);
    })();

    pageCountByScale.set(normalizedScale, pageCountPromise);
    return pageCountPromise;
  };

  const { minScale, maxScale } = getAutoFitScaleBounds();
  const { scale, fitStatus } = await findBestFitScale({
    minScale,
    maxScale,
    preferredScale: preferredScale ?? undefined,
    measurePageCount,
  });

  return {
    layout: buildResumeLayout({
      fontSize: settings.fontSize,
      fitScale: scale,
      enforceAtsBoundaries: true,
    }),
    scale,
    fitStatus: fitStatus as Exclude<AutoFitStatus, "disabled" | "error" | "stale">,
  };
};
