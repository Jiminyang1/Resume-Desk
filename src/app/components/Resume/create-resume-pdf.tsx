import { pdf } from "@react-pdf/renderer";
import { ResumePDF } from "components/Resume/ResumePDF";
import type { ResumeLayout } from "components/Resume/ResumePDF/layout";
import type { Settings } from "lib/redux/settingsSlice";
import type { Resume } from "lib/redux/types";

export const createResumePdfBlob = ({
  resume,
  settings,
  layout,
  profilePhotoDataUrl,
}: {
  resume: Resume;
  settings: Settings;
  layout: ResumeLayout;
  profilePhotoDataUrl?: string | null;
}) => {
  const resumeDocument = (
    <ResumePDF
      resume={resume}
      settings={settings}
      layout={layout}
      profilePhotoDataUrl={profilePhotoDataUrl}
    />
  );

  return pdf(resumeDocument).toBlob();
};
