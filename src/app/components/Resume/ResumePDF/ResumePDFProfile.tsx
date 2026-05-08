import { Image, View } from "@react-pdf/renderer";
import { ResumePDFIcon } from "components/Resume/ResumePDF/common/ResumePDFIcon";
import { styles } from "components/Resume/ResumePDF/styles";
import {
  ResumePDFLink,
  ResumePDFSection,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import { toPt, type ResumeLayout } from "components/Resume/ResumePDF/layout";
import {
  getProfileContactHref,
  getVisibleProfileContacts,
} from "lib/profile-contacts";
import type { ResumeProfile, ResumeProfileContact } from "lib/redux/types";

const getContactItemWidth = (itemCount: number) => {
  if (itemCount <= 0) return "33.333%";
  if (itemCount === 1) return "100%";
  if (itemCount === 2) return "50%";
  return "33.333%";
};

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
  const { name, summary, contacts } = profile;
  const visibleContacts = getVisibleProfileContacts(contacts);
  const contactItemWidth = getContactItemWidth(visibleContacts.length);

  const renderContactItem = (contact: ResumeProfileContact) => {
    const href = getProfileContactHref(contact);
    const text = (
      <ResumePDFText
        style={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 0,
          lineHeight: layout.lineHeight,
        }}
      >
        {contact.value.trim()}
      </ResumePDFText>
    );

    return (
      <View
        key={contact.id}
        style={{
          ...styles.flexRow,
          alignItems: "center",
          gap: toPt(layout.iconGapPt),
          width: contactItemWidth,
          paddingRight: toPt(layout.sectionGapPt),
          marginBottom: toPt(layout.compactGapPt),
        }}
      >
        <ResumePDFIcon type={contact.type} sizePt={layout.iconSizePt} />
        {href ? (
          <ResumePDFLink
            src={href}
            style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}
          >
            {text}
          </ResumePDFLink>
        ) : (
          text
        )}
      </View>
    );
  };

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
      {visibleContacts.length > 0 && (
        <View
          style={{
            ...styles.flexRow,
            flexWrap: "wrap",
            marginTop: toPt(layout.contactMarginTopPt),
          }}
        >
          {visibleContacts.map(renderContactItem)}
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
