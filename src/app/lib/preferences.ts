import type { UILanguage } from "lib/i18n";

export const APP_PREFERENCES_STORAGE_KEY = "open-resume-preferences";

export interface AppPreferences {
  uiLanguage: UILanguage;
}

const isSupportedUILanguage = (value: unknown): value is UILanguage =>
  value === "en" || value === "zh-CN";

const inferBrowserLanguage = (): UILanguage => {
  if (typeof navigator === "undefined") return "en";

  const browserLanguage =
    navigator.languages?.[0] ?? navigator.language ?? "en";
  return browserLanguage.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
};

export const getDefaultAppPreferences = (): AppPreferences => ({
  uiLanguage: inferBrowserLanguage(),
});

export const loadAppPreferences = (): AppPreferences => {
  const defaults = getDefaultAppPreferences();

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const storedValue = localStorage.getItem(APP_PREFERENCES_STORAGE_KEY);
    if (!storedValue) return defaults;

    const parsedValue = JSON.parse(storedValue) as Partial<AppPreferences>;
    return {
      uiLanguage: isSupportedUILanguage(parsedValue.uiLanguage)
        ? parsedValue.uiLanguage
        : defaults.uiLanguage,
    };
  } catch {
    return defaults;
  }
};

export const saveAppPreferences = (preferences: AppPreferences) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      APP_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences)
    );
  } catch {
    // Ignore storage write failures.
  }
};
