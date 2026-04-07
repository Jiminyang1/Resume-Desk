import { useEffect } from "react";
import { Font } from "@react-pdf/renderer";
import {
  ENGLISH_FONT_FAMILIES,
  NON_ENGLISH_FONT_FAMILIES,
} from "components/fonts/constants";
import { getFontAssetExtension } from "components/fonts/lib";
import { getPdfHyphenationSegments } from "components/fonts/pdf-font-fallback";

/**
 * Register all fonts to React PDF so it can render fonts correctly in PDF
 */
export const useRegisterReactPDFFont = () => {
  useEffect(() => {
    const allFontFamilies = [
      ...ENGLISH_FONT_FAMILIES,
      ...NON_ENGLISH_FONT_FAMILIES,
    ];
    allFontFamilies.forEach((fontFamily) => {
      const extension = getFontAssetExtension(fontFamily);
      Font.register({
        family: fontFamily,
        fonts: [
          {
            src: `/fonts/${fontFamily}-Regular.${extension}`,
          },
          {
            src: `/fonts/${fontFamily}-Bold.${extension}`,
            fontWeight: "bold",
          },
        ],
      });
    });
  }, []);
};

export const useRegisterReactPDFHyphenationCallback = () => {
  useEffect(() => {
    Font.registerHyphenationCallback((word) =>
      getPdfHyphenationSegments({ word })
    );
  }, []);
};
