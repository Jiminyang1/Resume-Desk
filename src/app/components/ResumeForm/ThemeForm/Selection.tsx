import { useTranslation } from "components/AppPreferencesProvider";
import type { GeneralSetting } from "lib/redux/settingsSlice";
import {
  FONT_FAMILY_TO_STANDARD_SIZE_IN_PT,
  FONT_FAMILY_TO_DISPLAY_NAME,
  type FontFamily,
} from "components/fonts/constants";
import { getAvailableFontFamiliesForContent } from "components/fonts/pdf-font-fallback";
import dynamic from "next/dynamic";

const Selection = ({
  selectedColor,
  isSelected,
  style = {},
  interactive = true,
  onClick,
  children,
}: {
  selectedColor: string;
  isSelected: boolean;
  style?: React.CSSProperties;
  interactive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  const selectedStyle = {
    color: "white",
    backgroundColor: selectedColor,
    borderColor: selectedColor,
    ...style,
  };

  return (
    <div
      className={`flex min-h-[30px] min-w-[76px] items-center justify-center rounded-sm border border-slate-300 px-2.5 py-1 text-[13px] font-medium leading-5 ${
        interactive
          ? "cursor-pointer text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          : "cursor-default text-white"
      }`}
      onClick={() => interactive && onClick()}
      style={isSelected ? selectedStyle : style}
      onKeyDown={(e) => {
        if (interactive && ["Enter", " "].includes(e.key)) onClick();
      }}
      tabIndex={interactive ? 0 : -1}
    >
      {children}
    </div>
  );
};

const SecondarySelection = ({
  selectedColor,
  isSelected,
  onClick,
  children,
}: {
  selectedColor: string;
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    className={`inline-flex min-h-[30px] items-center justify-center rounded-sm border px-2.5 py-1 text-[13px] font-medium leading-5 transition ${
      isSelected
        ? "text-white"
        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
    }`}
    style={
      isSelected
        ? {
            backgroundColor: selectedColor,
            borderColor: selectedColor,
            color: "white",
          }
        : undefined
    }
    onClick={onClick}
  >
    {children}
  </button>
);

const SelectionsWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="mt-1 flex flex-wrap gap-1.5">{children}</div>;
};

const FontFamilySelections = ({
  selectedFontFamily,
  content,
  themeColor,
  handleSettingsChange,
}: {
  selectedFontFamily: string;
  content: unknown;
  themeColor: string;
  handleSettingsChange: (field: GeneralSetting, value: string) => void;
}) => {
  const allFontFamilies = getAvailableFontFamiliesForContent(content);
  return (
    <SelectionsWrapper>
      {allFontFamilies.map((fontFamily, idx) => {
        const isSelected = selectedFontFamily === fontFamily;
        return (
          <SecondarySelection
            key={idx}
            selectedColor={themeColor}
            isSelected={isSelected}
            onClick={() => handleSettingsChange("fontFamily", fontFamily)}
          >
            {FONT_FAMILY_TO_DISPLAY_NAME[fontFamily]}
          </SecondarySelection>
        );
      })}
    </SelectionsWrapper>
  );
};

/**
 * Load FontFamilySelections client side to keep the theme form interactive
 * alongside the rest of the client-only builder UI.
 */
export const FontFamilySelectionsCSR = dynamic(
  () => Promise.resolve(FontFamilySelections),
  {
    ssr: false,
  }
);

export const FontSizeSelections = ({
  selectedFontSize,
  fontFamily,
  themeColor,
  handleSettingsChange,
}: {
  fontFamily: FontFamily;
  themeColor: string;
  selectedFontSize: string;
  handleSettingsChange: (field: GeneralSetting, value: string) => void;
}) => {
  const copy = useTranslation();
  const standardSizePt = FONT_FAMILY_TO_STANDARD_SIZE_IN_PT[fontFamily];
  const compactSizePt = standardSizePt - 1;
  const presetOptions = [
    copy.forms.settings.compact,
    copy.forms.settings.standard,
    copy.forms.settings.large,
  ].map((type, idx) => ({
    type,
    fontSizePt: String(compactSizePt + idx),
  }));
  const isCustomSelected = !presetOptions.some(
    ({ fontSizePt }) => fontSizePt === selectedFontSize
  );

  return (
    <SelectionsWrapper>
      {presetOptions.map(({ type, fontSizePt }, idx) => {
        const isSelected = fontSizePt === selectedFontSize;
        return (
          <Selection
            key={idx}
            selectedColor={themeColor}
            isSelected={isSelected}
            style={{
              fontFamily,
            }}
            onClick={() => handleSettingsChange("fontSize", fontSizePt)}
          >
            {type}
          </Selection>
        );
      })}
      {isCustomSelected && (
        <Selection
          selectedColor={themeColor}
          isSelected={true}
          interactive={false}
          onClick={() => {}}
        >
          <span>
            {copy.forms.settings.customSize} {selectedFontSize}pt
          </span>
        </Selection>
      )}
    </SelectionsWrapper>
  );
};

export const DocumentSizeSelections = ({
  selectedDocumentSize,
  themeColor,
  handleSettingsChange,
}: {
  themeColor: string;
  selectedDocumentSize: string;
  handleSettingsChange: (field: GeneralSetting, value: string) => void;
}) => {
  const copy = useTranslation();
  return (
    <SelectionsWrapper>
      {[
        {
          type: "Letter",
          title: copy.forms.settings.letter,
        },
        {
          type: "A4",
          title: copy.forms.settings.a4,
        },
      ].map(({ type, title }, idx) => {
        return (
          <Selection
            key={idx}
            selectedColor={themeColor}
            isSelected={type === selectedDocumentSize}
            onClick={() => handleSettingsChange("documentSize", type)}
          >
            <div>{title}</div>
          </Selection>
        );
      })}
    </SelectionsWrapper>
  );
};
