import { Image, View } from "@react-pdf/renderer";
import {
  ResumePDFIcon,
  type IconType,
} from "components/Resume/ResumePDF/common/ResumePDFIcon";
import { styles } from "components/Resume/ResumePDF/styles";
import {
  ResumePDFLink,
  ResumePDFSection,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import { toPt, type ResumeLayout } from "components/Resume/ResumePDF/layout";
import type { ResumeProfile } from "lib/redux/types";

export const ResumePDFProfile = ({
  layout,
  profile,
  profilePhotoDataUrl,
  nameColor,
}: {
  layout: ResumeLayout;
  profile: ResumeProfile;
  profilePhotoDataUrl?: string | null;
  nameColor?: string;
}) => {
  const { name, email, phone, url, summary, location, extraDetails } = profile;
  const iconProps = { email, phone, location, url };
  const visibleExtraDetails = extraDetails.filter(
    (detail) => detail.label.trim() || detail.value.trim()
  );

  const renderPrimaryContent = () => (
    <>
      <ResumePDFText
        bold={true}
        themeColor={nameColor}
        style={{ fontSize: toPt(layout.nameFontSizePt) }}
      >
        {name}
      </ResumePDFText>
      {Boolean(summary) ? <ResumePDFText>{summary}</ResumePDFText> : null}
      <View
        style={{
          ...styles.flexRowBetween,
          flexWrap: "wrap",
          marginTop: toPt(layout.compactGapPt),
        }}
      >
        {Object.entries(iconProps).map(([key, value]) => {
          if (!value) return null;

          let iconType = key as IconType;
          if (key === "url") {
            if (value.includes("github")) {
              iconType = "url_github";
            } else if (value.includes("linkedin")) {
              iconType = "url_linkedin";
            }
          }

          const shouldUseLinkWrapper = ["email", "url", "phone"].includes(key);
          const Wrapper = ({ children }: { children: React.ReactNode }) => {
            if (!shouldUseLinkWrapper) return <>{children}</>;

            let src = "";
            switch (key) {
              case "email": {
                src = `mailto:${value}`;
                break;
              }
              case "phone": {
                src = `tel:${value.replace(/[^\d+]/g, "")}`;
                break;
              }
              default: {
                src = value.startsWith("http") ? value : `https://${value}`;
              }
            }

            return (
              <ResumePDFLink src={src}>
                {children}
              </ResumePDFLink>
            );
          };

          return (
            <View
              key={key}
              style={{
                ...styles.flexRow,
                alignItems: "center",
                gap: toPt(layout.iconGapPt),
              }}
            >
              <ResumePDFIcon
                type={iconType}
                sizePt={layout.iconSizePt}
              />
              <Wrapper>
                <ResumePDFText>{value}</ResumePDFText>
              </Wrapper>
            </View>
          );
        })}
      </View>
      {visibleExtraDetails.length > 0 && (
        <View
          style={{
            ...styles.flexRow,
            flexWrap: "wrap",
            gap: toPt(layout.compactGapPt),
            marginTop: toPt(layout.compactGapPt),
          }}
        >
          {visibleExtraDetails.map((detail) => {
            const textValue = detail.label.trim()
              ? `${detail.label}: ${detail.value}`
              : detail.value;
            const content = <ResumePDFText>{textValue}</ResumePDFText>;

            if (detail.href?.trim()) {
              const href = detail.href.startsWith("http")
                ? detail.href
                : `https://${detail.href}`;
              return (
                <ResumePDFLink key={detail.id} src={href}>
                  {content}
                </ResumePDFLink>
              );
            }

            return <View key={detail.id}>{content}</View>;
          })}
        </View>
      )}
    </>
  );

  return (
    <ResumePDFSection
      layout={layout}
      style={{ marginTop: toPt(layout.profileMarginTopPt) }}
    >
      {profilePhotoDataUrl ? (
        <View
          style={{
            ...styles.flexRowBetween,
            alignItems: "flex-start",
            gap: toPt(layout.sectionGapPt),
          }}
        >
          <View style={{ ...styles.flexCol, flexGrow: 1, flexShrink: 1 }}>
            {renderPrimaryContent()}
          </View>
          {/* react-pdf Image does not support DOM alt semantics */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image
            src={profilePhotoDataUrl}
            style={{
              width: toPt(60),
              height: toPt(60),
              objectFit: "cover",
              borderRadius: toPt(8),
            }}
          />
        </View>
      ) : (
        renderPrimaryContent()
      )}
    </ResumePDFSection>
  );
};
