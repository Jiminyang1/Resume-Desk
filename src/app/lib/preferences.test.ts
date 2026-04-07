import {
  APP_PREFERENCES_STORAGE_KEY,
  loadAppPreferences,
  saveAppPreferences,
} from "lib/preferences";

describe("app preferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists the selected ui language", () => {
    saveAppPreferences({ uiLanguage: "zh-CN" });

    expect(localStorage.getItem(APP_PREFERENCES_STORAGE_KEY)).toBe(
      JSON.stringify({ uiLanguage: "zh-CN" })
    );
    expect(loadAppPreferences().uiLanguage).toBe("zh-CN");
  });
});
