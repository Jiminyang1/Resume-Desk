"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getDefaultAppPreferences,
  loadAppPreferences,
  saveAppPreferences,
  type AppPreferences,
} from "lib/preferences";
import {
  TRANSLATIONS,
  type TranslationDictionary,
  type UILanguage,
} from "lib/i18n";

type AppPreferencesContextValue = {
  preferences: AppPreferences;
  uiLanguage: UILanguage;
  setUiLanguage: (uiLanguage: UILanguage) => void;
  dictionary: TranslationDictionary;
};

const AppPreferencesContext = createContext<
  AppPreferencesContextValue | undefined
>(undefined);

export const AppPreferencesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [preferences, setPreferences] = useState<AppPreferences>(() =>
    getDefaultAppPreferences()
  );

  useEffect(() => {
    setPreferences(loadAppPreferences());
  }, []);

  useEffect(() => {
    document.documentElement.lang = preferences.uiLanguage;
  }, [preferences.uiLanguage]);

  const setUiLanguage = (uiLanguage: UILanguage) => {
    const nextPreferences = { uiLanguage };
    setPreferences(nextPreferences);
    saveAppPreferences(nextPreferences);
  };

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      preferences,
      uiLanguage: preferences.uiLanguage,
      setUiLanguage,
      dictionary: TRANSLATIONS[preferences.uiLanguage],
    }),
    [preferences]
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
};

export const useAppPreferences = () => {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error(
      "useAppPreferences must be used within AppPreferencesProvider"
    );
  }
  return context;
};

export const useTranslation = () => useAppPreferences().dictionary;
