import { View } from "@react-pdf/renderer";
import {
  ResumePDFBulletList,
  ResumePDFSection,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import { toNegativePt, toPt, type ResumeLayout } from "components/Resume/ResumePDF/layout";
import { styles } from "components/Resume/ResumePDF/styles";
import type { ResumeEducation } from "lib/redux/types";

export const ResumePDFEducation = ({
  heading,
  educations,
  layout,
  themeColor,
  headingColor,
  showBulletPoints,
}: {
  heading: string;
  educations: ResumeEducation[];
  layout: ResumeLayout;
  themeColor: string;
  headingColor?: string;
  showBulletPoints: boolean;
}) => {
  return (
    <ResumePDFSection
      themeColor={themeColor}
      headingColor={headingColor}
      heading={heading}
      layout={layout}
    >
      {educations.map(
        ({ school, degree, date, gpa, descriptions = [] }, idx) => {
          // Hide school name if it is the same as the previous school
          const hideSchoolName =
            idx > 0 && school === educations[idx - 1].school;
          const showDescriptions = descriptions.join() !== "";

          return (
            <View key={idx}>
              {!hideSchoolName && (
                <ResumePDFText bold={true}>{school}</ResumePDFText>
              )}
              <View
                style={{
                  ...styles.flexRowBetween,
                  marginTop: hideSchoolName
                    ? toNegativePt(layout.hiddenHeadingOffsetPt)
                    : toPt(layout.subSectionGapPt),
                }}
              >
                <ResumePDFText>{`${
                  gpa
                    ? `${degree} - ${Number(gpa) ? gpa + " GPA" : gpa}`
                    : degree
                }`}</ResumePDFText>
                <ResumePDFText>{date}</ResumePDFText>
              </View>
              {showDescriptions && (
                <View
                  style={{
                    ...styles.flexCol,
                    marginTop: toPt(layout.subSectionGapPt),
                  }}
                >
                  <ResumePDFBulletList
                    items={descriptions}
                    layout={layout}
                    showBulletPoints={showBulletPoints}
                  />
                </View>
              )}
            </View>
          );
        }
      )}
    </ResumePDFSection>
  );
};
