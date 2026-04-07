import { Page, View, Document } from "@react-pdf/renderer";
import {
  buildResumeLayout,
  toPt,
  type ResumeLayout,
} from "components/Resume/ResumePDF/layout";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import { ResumePDFProfile } from "components/Resume/ResumePDF/ResumePDFProfile";
import { ResumePDFWorkExperience } from "components/Resume/ResumePDF/ResumePDFWorkExperience";
import { ResumePDFEducation } from "components/Resume/ResumePDF/ResumePDFEducation";
import { ResumePDFProject } from "components/Resume/ResumePDF/ResumePDFProject";
import { ResumePDFSkills } from "components/Resume/ResumePDF/ResumePDFSkills";
import { ResumePDFCustom } from "components/Resume/ResumePDF/ResumePDFCustom";
import {
  DEFAULT_FONT_COLOR,
  DEFAULT_THEME_COLOR,
} from "lib/redux/settingsSlice";
import type { Settings, ShowForm } from "lib/redux/settingsSlice";
import {
  getVisibleResumeEntries,
  hasVisibleResumeEntries,
} from "lib/redux/resume-visibility";
import type { Resume } from "lib/redux/types";
import { getCompatibleFontFamilyForContent } from "components/fonts/pdf-font-fallback";

/**
 * ResumePDF is the single source of truth for generated resume PDFs used by
 * preview rendering, auto-fit measurement, and downloads.
 */
export const ResumePDF = ({
  resume,
  settings,
  layout,
  profilePhotoDataUrl,
}: {
  resume: Resume;
  settings: Settings;
  layout?: ResumeLayout;
  profilePhotoDataUrl?: string | null;
}) => {
  const { profile, workExperiences, educations, projects, skills, custom } =
    resume;
  const { name } = profile;
  const {
    fontFamily,
    fontSize,
    documentSize,
    formToHeading,
    formToShow,
    formsOrder,
    showBulletPoints,
  } = settings;
  const themeColor = settings.themeColor || DEFAULT_THEME_COLOR;
  const accentColor = settings.themeColorTargets?.banner
    ? themeColor
    : DEFAULT_FONT_COLOR;
  const nameColor = settings.themeColorTargets?.name ? themeColor : undefined;
  const headingColor = settings.themeColorTargets?.sectionHeadings
    ? themeColor
    : undefined;
  const pdfFontFamily = getCompatibleFontFamilyForContent({
    fontFamily,
    content: [resume, formToHeading],
  });
  const resolvedLayout = layout ?? buildResumeLayout({ fontSize });
  const visibleWorkExperiences = getVisibleResumeEntries(workExperiences);
  const visibleEducations = getVisibleResumeEntries(educations);
  const visibleProjects = getVisibleResumeEntries(projects);

  const showFormsOrder = formsOrder.filter((form) => {
    if (!formToShow[form]) return false;

    switch (form) {
      case "workExperiences":
        return hasVisibleResumeEntries(workExperiences);
      case "educations":
        return hasVisibleResumeEntries(educations);
      case "projects":
        return hasVisibleResumeEntries(projects);
      default:
        return true;
    }
  });

  const formTypeToComponent: { [type in ShowForm]: () => JSX.Element } = {
    workExperiences: () => (
      <ResumePDFWorkExperience
        heading={formToHeading["workExperiences"]}
        headingColor={headingColor}
        layout={resolvedLayout}
        workExperiences={visibleWorkExperiences}
        themeColor={accentColor}
      />
    ),
    educations: () => (
      <ResumePDFEducation
        heading={formToHeading["educations"]}
        educations={visibleEducations}
        headingColor={headingColor}
        layout={resolvedLayout}
        themeColor={accentColor}
        showBulletPoints={showBulletPoints["educations"]}
      />
    ),
    projects: () => (
      <ResumePDFProject
        heading={formToHeading["projects"]}
        headingColor={headingColor}
        layout={resolvedLayout}
        projects={visibleProjects}
        themeColor={accentColor}
      />
    ),
    skills: () => (
      <ResumePDFSkills
        heading={formToHeading["skills"]}
        headingColor={headingColor}
        layout={resolvedLayout}
        skills={skills}
        themeColor={accentColor}
        showBulletPoints={showBulletPoints["skills"]}
      />
    ),
    custom: () => (
      <ResumePDFCustom
        heading={formToHeading["custom"]}
        custom={custom}
        headingColor={headingColor}
        layout={resolvedLayout}
        themeColor={accentColor}
        showBulletPoints={showBulletPoints["custom"]}
      />
    ),
  };

  return (
    <Document
      title={`${name} Resume`}
      author={name}
      producer={"Resume Desk"}
    >
      <Page
        size={documentSize === "A4" ? "A4" : "LETTER"}
        style={{
          ...styles.flexCol,
          color: DEFAULT_FONT_COLOR,
          fontFamily: pdfFontFamily,
          fontSize: toPt(resolvedLayout.bodyFontSizePt),
        }}
      >
        {Boolean(accentColor) && (
          <View
            style={{
              width: spacing["full"],
              height: toPt(resolvedLayout.topAccentHeightPt),
              backgroundColor: accentColor,
            }}
          />
        )}
        <View
          style={{
            ...styles.flexCol,
            padding: `${toPt(resolvedLayout.pagePaddingTopPt)} ${toPt(
              resolvedLayout.pagePaddingXPt
            )} ${toPt(
              resolvedLayout.pagePaddingBottomPt +
                resolvedLayout.autoFitBottomReservePt
            )}`,
          }}
        >
          <ResumePDFProfile
            layout={resolvedLayout}
            profile={profile}
            profilePhotoDataUrl={profilePhotoDataUrl}
            nameColor={nameColor}
          />
          {showFormsOrder.map((form) => {
            const Component = formTypeToComponent[form];
            return <Component key={form} />;
          })}
        </View>
      </Page>
    </Document>
  );
};
