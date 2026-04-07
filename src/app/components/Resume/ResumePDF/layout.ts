export const MIN_BODY_FONT_SIZE_PT = 9.5;
export const MAX_BODY_FONT_SIZE_PT = 12;
export const MAX_MANUAL_BODY_FONT_SIZE_PT = 72;
export const DEFAULT_LAYOUT_SCALE = 1;
const DEFAULT_BODY_FONT_SIZE_PT = 11;

const roundTo = (value: number, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const scaleToken = ({
  base,
  fitScale,
  enforceBounds,
  min,
  max,
  digits = 2,
}: {
  base: number;
  fitScale: number;
  enforceBounds: boolean;
  min?: number;
  max?: number;
  digits?: number;
}) => {
  const scaledValue = base * fitScale;
  if (!enforceBounds) return roundTo(scaledValue, digits);

  const minValue = min ?? scaledValue;
  const maxValue = max ?? scaledValue;
  return roundTo(clamp(scaledValue, minValue, maxValue), digits);
};

export type ResumeLayout = {
  fitScale: number;
  bodyFontSizePt: number;
  nameFontSizePt: number;
  pagePaddingTopPt: number;
  pagePaddingBottomPt: number;
  autoFitBottomReservePt: number;
  profileMarginTopPt: number;
  contactMarginTopPt: number;
  sectionMarginTopPt: number;
  sectionGapPt: number;
  entryGapPt: number;
  subSectionGapPt: number;
  compactGapPt: number;
  hiddenHeadingOffsetPt: number;
  pagePaddingXPt: number;
  topAccentHeightPt: number;
  headingAccentWidthPt: number;
  headingAccentHeightPt: number;
  headingAccentGapPt: number;
  headingLetterSpacingPt: number;
  bulletPaddingXPt: number;
  lineHeight: number;
  iconGapPt: number;
  iconSizePt: number;
};

const AUTO_FIT_PAGE_PADDING_TOP_BASE_PT = 6;
const AUTO_FIT_PAGE_PADDING_BOTTOM_BASE_PT = 24;
const AUTO_FIT_BOTTOM_RESERVE_PT = 8;

const BASE_RESUME_LAYOUT = {
  nameFontSizePt: 20,
  profileMarginTopPt: 12,
  contactMarginTopPt: 1.5,
  sectionMarginTopPt: 15,
  sectionGapPt: 6,
  entryGapPt: 6,
  subSectionGapPt: 4.5,
  compactGapPt: 1.5,
  hiddenHeadingOffsetPt: 3,
  pagePaddingXPt: 60,
  topAccentHeightPt: 10.5,
  headingAccentWidthPt: 30,
  headingAccentHeightPt: 3.75,
  headingAccentGapPt: 10.5,
  headingLetterSpacingPt: 0.3,
  bulletPaddingXPt: 6,
  lineHeight: 1.3,
  iconGapPt: 3,
  iconSizePt: 13,
} as const;

const AUTO_FIT_LAYOUT_LIMITS = {
  pagePaddingTopPt: { min: 5, max: 10 },
  pagePaddingBottomPt: { min: 22, max: 32 },
  nameFontSizePt: { min: 17, max: 24 },
  profileMarginTopPt: { min: 10, max: 15 },
  contactMarginTopPt: { min: 1, max: 2 },
  sectionMarginTopPt: { min: 9, max: 18 },
  sectionGapPt: { min: 4, max: 8 },
  entryGapPt: { min: 4, max: 8 },
  subSectionGapPt: { min: 3, max: 6 },
  compactGapPt: { min: 1, max: 2.25 },
  hiddenHeadingOffsetPt: { min: 2, max: 4 },
  pagePaddingXPt: { min: 42, max: 72 },
  topAccentHeightPt: { min: 8, max: 13 },
  headingAccentWidthPt: { min: 24, max: 36 },
  headingAccentHeightPt: { min: 3, max: 4.5 },
  headingAccentGapPt: { min: 8, max: 12.5 },
  headingLetterSpacingPt: { min: 0.2, max: 0.4 },
  bulletPaddingXPt: { min: 4, max: 8 },
  lineHeight: { min: 1.18, max: 1.35 },
  iconGapPt: { min: 2, max: 4 },
  iconSizePt: { min: 11, max: 14.5 },
} as const;

export const toPt = (value: number) => `${roundTo(value, 2)}pt`;
export const toNegativePt = (value: number) => `-${toPt(value)}`;

export const getBaseBodyFontSizePt = (
  fontSize: string,
  {
    maxBodyFontSizePt = Number.POSITIVE_INFINITY,
  }: {
    maxBodyFontSizePt?: number;
  } = {}
) => {
  const parsedFontSize = Number(fontSize);
  if (!Number.isFinite(parsedFontSize) || parsedFontSize <= 0) {
    return DEFAULT_BODY_FONT_SIZE_PT;
  }

  return roundTo(Math.min(parsedFontSize, maxBodyFontSizePt), 2);
};

export const buildResumeLayout = ({
  fontSize,
  fitScale = DEFAULT_LAYOUT_SCALE,
  enforceAtsBoundaries = false,
}: {
  fontSize: string;
  fitScale?: number;
  enforceAtsBoundaries?: boolean;
}): ResumeLayout => {
  const baseBodyFontSizePt = getBaseBodyFontSizePt(fontSize, {
    maxBodyFontSizePt: MAX_MANUAL_BODY_FONT_SIZE_PT,
  });
  const scaledBodyFontSize = baseBodyFontSizePt * fitScale;
  const verticalPagePaddingTopPt = enforceAtsBoundaries
    ? AUTO_FIT_PAGE_PADDING_TOP_BASE_PT
    : 0;
  const verticalPagePaddingBottomPt = enforceAtsBoundaries
    ? AUTO_FIT_PAGE_PADDING_BOTTOM_BASE_PT
    : 0;
  const bodyFontSizePt = roundTo(scaledBodyFontSize, 2);

  return {
    fitScale: roundTo(fitScale, 3),
    bodyFontSizePt,
    pagePaddingTopPt: scaleToken({
      base: verticalPagePaddingTopPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.pagePaddingTopPt,
    }),
    pagePaddingBottomPt: scaleToken({
      base: verticalPagePaddingBottomPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.pagePaddingBottomPt,
    }),
    autoFitBottomReservePt: enforceAtsBoundaries ? AUTO_FIT_BOTTOM_RESERVE_PT : 0,
    nameFontSizePt: scaleToken({
      base: BASE_RESUME_LAYOUT.nameFontSizePt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.nameFontSizePt,
    }),
    profileMarginTopPt: scaleToken({
      base: BASE_RESUME_LAYOUT.profileMarginTopPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.profileMarginTopPt,
    }),
    contactMarginTopPt: scaleToken({
      base: BASE_RESUME_LAYOUT.contactMarginTopPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.contactMarginTopPt,
    }),
    sectionMarginTopPt: scaleToken({
      base: BASE_RESUME_LAYOUT.sectionMarginTopPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.sectionMarginTopPt,
    }),
    sectionGapPt: scaleToken({
      base: BASE_RESUME_LAYOUT.sectionGapPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.sectionGapPt,
    }),
    entryGapPt: scaleToken({
      base: BASE_RESUME_LAYOUT.entryGapPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.entryGapPt,
    }),
    subSectionGapPt: scaleToken({
      base: BASE_RESUME_LAYOUT.subSectionGapPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.subSectionGapPt,
    }),
    compactGapPt: scaleToken({
      base: BASE_RESUME_LAYOUT.compactGapPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.compactGapPt,
    }),
    hiddenHeadingOffsetPt: scaleToken({
      base: BASE_RESUME_LAYOUT.hiddenHeadingOffsetPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.hiddenHeadingOffsetPt,
    }),
    pagePaddingXPt: scaleToken({
      base: BASE_RESUME_LAYOUT.pagePaddingXPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.pagePaddingXPt,
    }),
    topAccentHeightPt: scaleToken({
      base: BASE_RESUME_LAYOUT.topAccentHeightPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.topAccentHeightPt,
    }),
    headingAccentWidthPt: scaleToken({
      base: BASE_RESUME_LAYOUT.headingAccentWidthPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.headingAccentWidthPt,
    }),
    headingAccentHeightPt: scaleToken({
      base: BASE_RESUME_LAYOUT.headingAccentHeightPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.headingAccentHeightPt,
    }),
    headingAccentGapPt: scaleToken({
      base: BASE_RESUME_LAYOUT.headingAccentGapPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.headingAccentGapPt,
    }),
    headingLetterSpacingPt: scaleToken({
      base: BASE_RESUME_LAYOUT.headingLetterSpacingPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.headingLetterSpacingPt,
      digits: 3,
    }),
    bulletPaddingXPt: scaleToken({
      base: BASE_RESUME_LAYOUT.bulletPaddingXPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.bulletPaddingXPt,
    }),
    lineHeight: scaleToken({
      base: BASE_RESUME_LAYOUT.lineHeight,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.lineHeight,
      digits: 3,
    }),
    iconGapPt: scaleToken({
      base: BASE_RESUME_LAYOUT.iconGapPt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.iconGapPt,
    }),
    iconSizePt: scaleToken({
      base: BASE_RESUME_LAYOUT.iconSizePt,
      fitScale,
      enforceBounds: enforceAtsBoundaries,
      ...AUTO_FIT_LAYOUT_LIMITS.iconSizePt,
    }),
  };
};
