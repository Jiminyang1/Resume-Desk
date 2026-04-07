import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppPreferences } from "components/AppPreferencesProvider";
import { getAllFontFamiliesToLoad } from "components/fonts/lib";
import { useAppSelector } from "lib/redux/hooks";
import { selectSettings } from "lib/redux/settingsSlice";

const FontsZhCSR = dynamic(() => import("components/fonts/FontsZh"), {
  ssr: false,
});

/**
 * Empty component to lazy load non-english fonts CSS conditionally
 *
 * Reference: https://prawira.medium.com/react-conditional-import-conditional-css-import-110cc58e0da6
 */
export const NonEnglishFontsCSSLazyLoader = () => {
  const { uiLanguage } = useAppPreferences();
  const { fontFamily } = useAppSelector(selectSettings);
  const [shouldLoadFontsZh, setShouldLoadFontsZh] = useState(false);

  useEffect(() => {
    const shouldLoad = getAllFontFamiliesToLoad({
      uiLanguage,
      selectedFontFamily: fontFamily,
    }).some((family) => family.startsWith("Noto") && family.endsWith("SC"));

    setShouldLoadFontsZh(shouldLoad);
  }, [fontFamily, uiLanguage]);

  return <>{shouldLoadFontsZh && <FontsZhCSR />}</>;
};
