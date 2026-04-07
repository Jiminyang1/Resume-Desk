"use client";
import {
  ENGLISH_FONT_FAMILIES,
  NON_ENGLISH_FONT_FAMILIES,
  NON_ENGLISH_FONT_FAMILY_TO_LANGUAGE,
  type FontFamily,
} from "components/fonts/constants";
import type { UILanguage } from "lib/i18n";

/**
 * getPreferredNonEnglishFontFamilies returns non-english font families that are included in
 * user's preferred languages. This is to avoid loading fonts/languages that users won't use.
 */
const getPreferredNonEnglishFontFamilies = () => {
  return NON_ENGLISH_FONT_FAMILIES.filter((fontFamily) => {
    const fontLanguages = NON_ENGLISH_FONT_FAMILY_TO_LANGUAGE[fontFamily];
    const userPreferredLanguages = navigator.languages ?? [navigator.language];
    return userPreferredLanguages.some((preferredLanguage) =>
      fontLanguages.includes(preferredLanguage)
    );
  });
};

const isNonEnglishFontFamily = (
  fontFamily?: FontFamily | string
): fontFamily is (typeof NON_ENGLISH_FONT_FAMILIES)[number] =>
  NON_ENGLISH_FONT_FAMILIES.some((candidate) => candidate === fontFamily);

export const getAllFontFamiliesToLoad = ({
  uiLanguage,
  selectedFontFamily,
}: {
  uiLanguage?: UILanguage;
  selectedFontFamily?: FontFamily | string;
} = {}) => {
  const shouldLoadChineseFonts =
    uiLanguage === "zh-CN" || isNonEnglishFontFamily(selectedFontFamily);

  return shouldLoadChineseFonts
    ? [...ENGLISH_FONT_FAMILIES, ...NON_ENGLISH_FONT_FAMILIES]
    : [...ENGLISH_FONT_FAMILIES, ...getPreferredNonEnglishFontFamilies()];
};

export const getFontAssetExtension = (fontFamily: string) =>
  fontFamily === "NotoSerifSC" ? "otf" : "ttf";
