import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import { toNegativePt, toPt, type ResumeLayout } from "components/Resume/ResumePDF/layout";
import { styles } from "components/Resume/ResumePDF/styles";
import type { ResumeWorkExperience } from "lib/redux/types";

export const ResumePDFWorkExperience = ({
  heading,
  layout,
  workExperiences,
  themeColor,
  headingColor,
}: {
  heading: string;
  layout: ResumeLayout;
  workExperiences: ResumeWorkExperience[];
  themeColor: string;
  headingColor?: string;
}) => {
  return (
    <ResumePDFSection
      themeColor={themeColor}
      headingColor={headingColor}
      heading={heading}
      layout={layout}
    >
      {workExperiences.map(({ company, jobTitle, date, descriptions }, idx) => {
        // Hide company name if it is the same as the previous company
        const hideCompanyName =
          idx > 0 && company === workExperiences[idx - 1].company;

        return (
          <View
            key={idx}
            style={idx !== 0 ? { marginTop: toPt(layout.entryGapPt) } : {}}
          >
            {!hideCompanyName && (
              <ResumePDFText bold={true}>{company}</ResumePDFText>
            )}
            <View
              style={{
                ...styles.flexRowBetween,
                marginTop: hideCompanyName
                  ? toNegativePt(layout.hiddenHeadingOffsetPt)
                  : toPt(layout.subSectionGapPt),
              }}
            >
              <ResumePDFText>{jobTitle}</ResumePDFText>
              <ResumePDFText>{date}</ResumePDFText>
            </View>
            <View style={{ ...styles.flexCol, marginTop: toPt(layout.subSectionGapPt) }}>
              <ResumePDFBulletList items={descriptions} layout={layout} />
            </View>
          </View>
        );
      })}
    </ResumePDFSection>
  );
};
