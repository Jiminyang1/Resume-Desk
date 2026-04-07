import { Text, View, Link } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import {
  toPt,
  type ResumeLayout,
} from "components/Resume/ResumePDF/layout";
import { styles } from "components/Resume/ResumePDF/styles";
import { getRichTextSegmentsFromMarkdown } from "lib/bullet-list-rich-text";
import { DEFAULT_FONT_COLOR } from "lib/redux/settingsSlice";

export const ResumePDFSection = ({
  themeColor,
  headingColor,
  heading,
  layout,
  style = {},
  children,
}: {
  themeColor?: string;
  headingColor?: string;
  heading?: string;
  layout: ResumeLayout;
  style?: Style;
  children: React.ReactNode;
}) => {
  return (
    <View
      style={{
        ...styles.flexCol,
        gap: toPt(layout.sectionGapPt),
        marginTop: toPt(layout.sectionMarginTopPt),
        ...style,
      }}
    >
      {Boolean(heading) ? (
        <View style={{ ...styles.flexRow, alignItems: "center" }}>
          {Boolean(themeColor) ? (
            <View
              style={{
                height: toPt(layout.headingAccentHeightPt),
                width: toPt(layout.headingAccentWidthPt),
                backgroundColor: themeColor,
                marginRight: toPt(layout.headingAccentGapPt),
              }}
            />
          ) : null}
          <Text
            style={{
              color: headingColor || DEFAULT_FONT_COLOR,
              fontWeight: "bold",
              letterSpacing: toPt(layout.headingLetterSpacingPt),
            }}
          >
            {heading}
          </Text>
        </View>
      ) : null}
      {children}
    </View>
  );
};

export const ResumePDFText = ({
  bold = false,
  themeColor,
  style = {},
  children,
}: {
  bold?: boolean;
  themeColor?: string;
  style?: Style;
  children: React.ReactNode;
}) => {
  return (
    <Text
      style={{
        color: themeColor || DEFAULT_FONT_COLOR,
        fontWeight: bold ? "bold" : "normal",
        ...style,
      }}
    >
      {children}
    </Text>
  );
};

export const ResumePDFBulletList = ({
  items,
  layout,
  showBulletPoints = true,
}: {
  items: string[];
  layout: ResumeLayout;
  showBulletPoints?: boolean;
}) => {
  return (
    <>
      {items.map((item, idx) => (
        <View style={{ ...styles.flexRow }} key={idx}>
          {showBulletPoints && (
            <ResumePDFText
              style={{
                paddingLeft: toPt(layout.bulletPaddingXPt),
                paddingRight: toPt(layout.bulletPaddingXPt),
                lineHeight: layout.lineHeight,
              }}
              bold={true}
            >
              {"•"}
            </ResumePDFText>
          )}
          {/* A breaking change was introduced causing text layout to be wider than node's width
              https://github.com/diegomura/react-pdf/issues/2182. flexGrow & flexBasis fixes it */}
          <ResumePDFText
            style={{ lineHeight: layout.lineHeight, flexGrow: 1, flexBasis: 0 }}
          >
            {getRichTextSegmentsFromMarkdown(item).map((segment, segmentIdx) => (
              <Text
                key={`${idx}-${segmentIdx}`}
                style={{ fontWeight: segment.bold ? "bold" : "normal" }}
              >
                {segment.text}
              </Text>
            ))}
          </ResumePDFText>
        </View>
      ))}
    </>
  );
};

export const ResumePDFLink = ({
  src,
  children,
}: {
  src: string;
  children: React.ReactNode;
}) => (
  <Link src={src} style={{ textDecoration: "none" }}>
    {children}
  </Link>
);
