import { useEffect, useState } from "react";
import { useTranslation } from "components/AppPreferencesProvider";
import { useAutoFitContext } from "components/Resume/AutoFitContext";
import {
  getBaseBodyFontSizePt,
  MIN_BODY_FONT_SIZE_PT,
  MAX_BODY_FONT_SIZE_PT,
  MAX_MANUAL_BODY_FONT_SIZE_PT,
} from "components/Resume/ResumePDF/layout";
import { BaseForm } from "components/ResumeForm/Form";
import { InputGroupWrapper } from "components/ResumeForm/Form/InputGroup";
import { InlineInput } from "components/ResumeForm/ThemeForm/InlineInput";
import {
  DocumentSizeSelections,
  FontFamilySelectionsCSR,
  FontSizeSelections,
} from "components/ResumeForm/ThemeForm/Selection";
import {
  changeAutoFitOnePage,
  changeThemeColorTarget,
  changeSettings,
  DEFAULT_THEME_COLOR,
  selectSettings,
  type GeneralSetting,
  type ThemeColorTarget,
} from "lib/redux/settingsSlice";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import type { FontFamily } from "components/fonts/constants";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { selectResume } from "lib/redux/resumeSlice";
import { getCompatibleFontFamilyForContent } from "components/fonts/pdf-font-fallback";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{6})$/;

const formatFontSizePt = (value: number) => {
  const roundedValue = Math.round(value * 100) / 100;
  return Number.isInteger(roundedValue)
    ? String(roundedValue)
    : roundedValue.toFixed(2).replace(/\.?0+$/, "");
};

const normalizeThemeColor = (value?: string) => {
  if (!value) return DEFAULT_THEME_COLOR;
  return HEX_COLOR_PATTERN.test(value) ? value : DEFAULT_THEME_COLOR;
};

const RECOMMENDED_ATS_FONT_SIZE_RANGE_LABEL = `${formatFontSizePt(
  MIN_BODY_FONT_SIZE_PT
)}-${formatFontSizePt(MAX_BODY_FONT_SIZE_PT)}pt`;

const normalizeFontSizeInput = (value: string) => {
  if (value.trim() === "") return value;

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return value;
  }

  return parsedValue > MAX_MANUAL_BODY_FONT_SIZE_PT
    ? String(MAX_MANUAL_BODY_FONT_SIZE_PT)
    : value;
};

const themeColorTargetOptions: {
  target: ThemeColorTarget;
  labelKey: "banner" | "name" | "sectionTitles";
}[] = [
  {
    target: "banner",
    labelKey: "banner",
  },
  {
    target: "name",
    labelKey: "name",
  },
  {
    target: "sectionHeadings",
    labelKey: "sectionTitles",
  },
];

export const ThemeForm = () => {
  const copy = useTranslation();
  const resume = useAppSelector(selectResume);
  const settings = useAppSelector(selectSettings);
  const {
    fontSize,
    fontFamily,
    documentSize,
    autoFitOnePage,
    themeColorTargets,
  } = settings;
  const themeColor = normalizeThemeColor(settings.themeColor);
  const [themeColorDraft, setThemeColorDraft] = useState(themeColor);
  const dispatch = useAppDispatch();
  const { effectiveLayout, fitStatus, isComputing, recomputeAutoFit } =
    useAutoFitContext();
  const parsedFontSize = Number(fontSize);
  const chosenFontSizePt = getBaseBodyFontSizePt(fontSize, {
    maxBodyFontSizePt: MAX_MANUAL_BODY_FONT_SIZE_PT,
  });
  const chosenFontSizeDisplay = formatFontSizePt(chosenFontSizePt);
  const effectiveFontSizePt = effectiveLayout.bodyFontSizePt;
  const effectiveFontSizeDisplay = formatFontSizePt(effectiveFontSizePt);
  const hasAdjustedFontSize =
    Math.abs(effectiveFontSizePt - chosenFontSizePt) >= 0.05;
  const displayedFontSize = autoFitOnePage
    ? effectiveFontSizeDisplay
    : fontSize;
  const fontSizeLabel = autoFitOnePage
    ? copy.forms.settings.appliedFontSize
    : copy.forms.settings.fontSize;
  const atsReferenceFontSizePt = autoFitOnePage
    ? effectiveFontSizePt
    : chosenFontSizePt;
  const atsReferenceFontSizeDisplay = formatFontSizePt(atsReferenceFontSizePt);
  const isOutsideRecommendedAtsRange =
    atsReferenceFontSizePt < MIN_BODY_FONT_SIZE_PT ||
    atsReferenceFontSizePt > MAX_BODY_FONT_SIZE_PT;

  useEffect(() => {
    if (
      Number.isFinite(parsedFontSize) &&
      parsedFontSize > MAX_MANUAL_BODY_FONT_SIZE_PT
    ) {
      dispatch(
        changeSettings({
          field: "fontSize",
          value: chosenFontSizeDisplay,
        })
      );
    }
  }, [chosenFontSizeDisplay, dispatch, parsedFontSize]);

  useEffect(() => {
    setThemeColorDraft(themeColor);
  }, [themeColor]);

  useEffect(() => {
    const compatibleFontFamily = getCompatibleFontFamilyForContent({
      fontFamily,
      content: [resume, settings.formToHeading],
    });

    if (compatibleFontFamily !== fontFamily) {
      dispatch(
        changeSettings({
          field: "fontFamily",
          value: compatibleFontFamily,
        })
      );
    }
  }, [dispatch, fontFamily, resume, settings.formToHeading]);

  const handleSettingsChange = (field: GeneralSetting, value: string) => {
    const normalizedValue =
      field === "fontSize" ? normalizeFontSizeInput(value) : value;
    dispatch(changeSettings({ field, value: normalizedValue }));
  };

  const handleThemeColorChange = (value: string) => {
    dispatch(
      changeSettings({
        field: "themeColor",
        value: normalizeThemeColor(value).toLowerCase(),
      })
    );
  };

  const handleThemeColorDraftCommit = () => {
    if (HEX_COLOR_PATTERN.test(themeColorDraft)) {
      handleThemeColorChange(themeColorDraft);
    } else {
      setThemeColorDraft(themeColor);
    }
  };

  const handleThemeColorTargetChange = (
    field: ThemeColorTarget,
    value: boolean
  ) => {
    dispatch(changeThemeColorTarget({ field, value }));
  };

  const handleAutoFitToggle = (checked: boolean) => {
    dispatch(changeAutoFitOnePage(checked));
  };

  const autoFitStatusText = !autoFitOnePage
    ? null
    : isComputing
      ? copy.forms.settings.autoFitSearching
      : fitStatus === "stale"
        ? copy.forms.settings.autoFitStale(effectiveFontSizeDisplay)
      : fitStatus === "overflowAtLimit"
        ? copy.forms.settings.autoFitOverflow(effectiveFontSizeDisplay)
        : fitStatus === "error"
          ? copy.forms.settings.autoFitError(chosenFontSizeDisplay)
          : hasAdjustedFontSize
            ? copy.forms.settings.autoFitApplied(effectiveFontSizeDisplay)
            : copy.forms.settings.autoFitAlready(effectiveFontSizeDisplay);

  const atsFontSizeWarning = isOutsideRecommendedAtsRange
    ? atsReferenceFontSizePt < MIN_BODY_FONT_SIZE_PT
      ? copy.forms.settings.atsWarningBelow(
          atsReferenceFontSizeDisplay,
          RECOMMENDED_ATS_FONT_SIZE_RANGE_LABEL
        )
      : copy.forms.settings.atsWarningAbove(
          atsReferenceFontSizeDisplay,
          RECOMMENDED_ATS_FONT_SIZE_RANGE_LABEL
        )
    : null;

  return (
    <BaseForm>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Cog6ToothIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />
          <h1 className="text-lg font-semibold tracking-wide text-gray-900 ">
            {copy.forms.settings.title}
          </h1>
        </div>
        <div className="border border-slate-300 bg-stone-50">
          <div className="px-3.5 py-3.5">
            <InputGroupWrapper label={copy.forms.settings.themeColor} />
            <div className="mt-2 flex items-center gap-3 border border-slate-300 bg-white px-3.5 py-2.5">
              <label className="relative block h-[50px] w-[50px] shrink-0 cursor-pointer">
                <span
                  className="absolute inset-0 border border-slate-300"
                  style={{ backgroundColor: themeColor }}
                />
                <input
                  type="color"
                  aria-label={copy.forms.settings.themeColor}
                  value={themeColor}
                  onChange={(e) => handleThemeColorChange(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900">
                  {copy.forms.settings.accentColor}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    inputMode="text"
                    aria-label={copy.forms.settings.accentColor}
                    value={themeColorDraft.toUpperCase()}
                    onChange={(e) => setThemeColorDraft(e.target.value)}
                    onBlur={handleThemeColorDraftCommit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleThemeColorDraftCommit();
                      }
                      if (e.key === "Escape") {
                        setThemeColorDraft(themeColor);
                      }
                    }}
                    className="w-28 rounded-sm border border-slate-300 bg-white px-3 py-1 text-sm font-semibold tracking-wide text-gray-700 outline-none transition focus:border-slate-500"
                  />
                  <button
                    type="button"
                    className="text-sm font-medium text-gray-500 underline-offset-4 hover:text-gray-700 hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-50"
                    onClick={() => handleThemeColorChange(DEFAULT_THEME_COLOR)}
                    disabled={themeColor === DEFAULT_THEME_COLOR}
                  >
                    {copy.forms.settings.reset}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                {copy.forms.settings.applyTo}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {themeColorTargetOptions.map(({ target, labelKey }) => {
                  const isSelected = themeColorTargets[target];
                  const label =
                    labelKey === "banner"
                      ? copy.forms.settings.banner
                      : labelKey === "name"
                        ? copy.forms.settings.name
                        : copy.forms.settings.sectionTitles;

                  return (
                    <button
                      key={target}
                      type="button"
                      aria-pressed={isSelected}
                      className={`inline-flex min-h-[30px] items-center justify-center rounded-sm border px-2.5 py-1 text-[13px] font-medium leading-5 transition ${
                        isSelected
                          ? "border-transparent text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                      style={
                        isSelected
                          ? {
                              backgroundColor: themeColor,
                            }
                          : undefined
                      }
                      onClick={() =>
                        handleThemeColorTargetChange(target, !isSelected)
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-300 px-3.5 py-3.5">
            <InputGroupWrapper label={copy.forms.settings.fontFamily} />
            <FontFamilySelectionsCSR
              selectedFontFamily={fontFamily}
              content={[resume, settings.formToHeading]}
              themeColor={themeColor}
              handleSettingsChange={handleSettingsChange}
            />
          </div>
        </div>
        <div className="border border-slate-300 bg-stone-50">
          <div className="px-3.5 py-3.5">
            <InlineInput
              label={fontSizeLabel}
              name="fontSize"
              value={displayedFontSize}
              placeholder="11"
              readOnly={autoFitOnePage}
              onChange={handleSettingsChange}
            />
            <FontSizeSelections
              fontFamily={fontFamily as FontFamily}
              themeColor={themeColor}
              selectedFontSize={fontSize}
              handleSettingsChange={handleSettingsChange}
            />
            {atsFontSizeWarning && (
              <p className="mt-2 text-sm text-amber-700">
                {atsFontSizeWarning}
              </p>
            )}
          </div>
          <div className="border-t border-slate-300 px-3.5 py-3.5">
            <InputGroupWrapper label={copy.forms.settings.documentSize} />
            <DocumentSizeSelections
              themeColor={themeColor}
              selectedDocumentSize={documentSize}
              handleSettingsChange={handleSettingsChange}
            />
          </div>
          <div className="border-t border-slate-300 px-3.5 py-3.5">
            <InputGroupWrapper label={copy.forms.settings.autoFit} />
            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={autoFitOnePage}
                onChange={(e) => handleAutoFitToggle(e.target.checked)}
              />
              <span className="font-medium leading-5">
                {copy.forms.settings.autoFitDescription}
              </span>
            </label>
            {autoFitStatusText && (
              <p
                className={`mt-2 text-sm ${
                  fitStatus === "overflowAtLimit" || fitStatus === "error"
                    ? "text-amber-700"
                    : "text-gray-500"
                }`}
              >
                {autoFitStatusText}
              </p>
            )}
            {autoFitOnePage && fitStatus === "stale" && !isComputing && (
              <button
                type="button"
                className="btn-secondary mt-3 h-9 px-3 text-sm"
                onClick={() => {
                  void recomputeAutoFit();
                }}
              >
                {copy.forms.settings.autoFitRefit}
              </button>
            )}
          </div>
        </div>
      </div>
    </BaseForm>
  );
};
