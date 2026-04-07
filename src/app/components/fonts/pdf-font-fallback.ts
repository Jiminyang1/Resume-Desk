import {
  ENGLISH_FONT_FAMILIES,
  NON_ENGLISH_FONT_FAMILIES,
  SERIF_ENGLISH_FONT_FAMILIES,
  type FontFamily,
} from "components/fonts/constants";

const CJK_OR_FULLWIDTH_REGEX = /[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/u;
const DEFAULT_ENGLISH_SANS_FONT_FAMILY = "Roboto";
const DEFAULT_ENGLISH_SERIF_FONT_FAMILY = "RobotoSlab";

const isNonEnglishFontFamily = (fontFamily: string) =>
  NON_ENGLISH_FONT_FAMILIES.includes(fontFamily as any);

const isSerifFontFamily = (fontFamily: string) =>
  fontFamily === "NotoSerifSC" ||
  SERIF_ENGLISH_FONT_FAMILIES.includes(fontFamily as any);

export const textNeedsCjkFallback = (text: string) =>
  CJK_OR_FULLWIDTH_REGEX.test(text);

export const getPdfFallbackFontFamily = (fontFamily: string) => {
  if (isNonEnglishFontFamily(fontFamily)) return fontFamily;

  return SERIF_ENGLISH_FONT_FAMILIES.includes(fontFamily as any)
    ? "NotoSerifSC"
    : "NotoSansSC";
};

export const containsCjkText = (value: unknown): boolean => {
  if (value == null) return false;
  if (typeof value === "string") return textNeedsCjkFallback(value);
  if (typeof value === "number" || typeof value === "boolean") return false;
  if (Array.isArray(value)) return value.some(containsCjkText);
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(containsCjkText);
  }

  return false;
};

export const getAvailableFontFamiliesForContent = (
  content: unknown
): FontFamily[] =>
  containsCjkText(content)
    ? [...NON_ENGLISH_FONT_FAMILIES]
    : [...ENGLISH_FONT_FAMILIES];

export const getCompatibleFontFamilyForContent = ({
  fontFamily,
  content,
}: {
  fontFamily: string;
  content: unknown;
}) => {
  if (containsCjkText(content)) {
    return getPdfFallbackFontFamily(fontFamily);
  }

  if (isNonEnglishFontFamily(fontFamily)) {
    return isSerifFontFamily(fontFamily)
      ? DEFAULT_ENGLISH_SERIF_FONT_FAMILY
      : DEFAULT_ENGLISH_SANS_FONT_FAMILY;
  }

  return fontFamily;
};

export const getPdfHyphenationSegments = ({
  word,
}: {
  word: string;
}) => {
  return textNeedsCjkFallback(word)
    ? word
        .split("")
        .map((char) => [char, ""])
        .flat()
    : [word];
};
