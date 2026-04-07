import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
} from "components/Resume/ResumePDF/common";
import { type ResumeLayout } from "components/Resume/ResumePDF/layout";
import { styles } from "components/Resume/ResumePDF/styles";
import type { ResumeCustom } from "lib/redux/types";

export const ResumePDFCustom = ({
  heading,
  custom,
  layout,
  themeColor,
  headingColor,
  showBulletPoints,
}: {
  heading: string;
  custom: ResumeCustom;
  layout: ResumeLayout;
  themeColor: string;
  headingColor?: string;
  showBulletPoints: boolean;
}) => {
  const { descriptions } = custom;

  return (
    <ResumePDFSection
      themeColor={themeColor}
      headingColor={headingColor}
      heading={heading}
      layout={layout}
    >
      <View style={{ ...styles.flexCol }}>
        <ResumePDFBulletList
          items={descriptions}
          layout={layout}
          showBulletPoints={showBulletPoints}
        />
      </View>
    </ResumePDFSection>
  );
};
