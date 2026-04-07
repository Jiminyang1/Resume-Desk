import type { Settings } from "lib/redux/settingsSlice";
import type { Resume } from "lib/redux/types";

export type ResumePreset = "english" | "chinese";
export type ResumeLanguage = "en" | "zh-CN";

export const ENGLISH_FORM_HEADINGS: Settings["formToHeading"] = {
  workExperiences: "WORK EXPERIENCE",
  educations: "EDUCATION",
  projects: "PROJECT",
  skills: "SKILLS",
  custom: "CUSTOM SECTION",
};

export const CHINESE_FORM_HEADINGS: Settings["formToHeading"] = {
  workExperiences: "工作经历",
  educations: "教育经历",
  projects: "项目经历",
  skills: "技能",
  custom: "自定义栏目",
};

export const ENGLISH_UNTITLED_RESUME_TITLE = "Untitled Resume";
export const CHINESE_UNTITLED_RESUME_TITLE = "未命名简历";

export const createDefaultResume = (): Resume => ({
  profile: {
    name: "",
    summary: "",
    email: "",
    phone: "",
    location: "",
    url: "",
    photoAssetId: null,
    extraDetails: [],
  },
  workExperiences: [
    {
      visible: true,
      company: "",
      jobTitle: "",
      date: "",
      descriptions: [],
    },
  ],
  educations: [
    {
      visible: true,
      school: "",
      degree: "",
      gpa: "",
      date: "",
      descriptions: [],
    },
  ],
  projects: [
    {
      visible: true,
      project: "",
      date: "",
      descriptions: [],
    },
  ],
  skills: {
    descriptions: [],
  },
  custom: {
    descriptions: [],
  },
});

export const createDefaultSettingsForPreset = (
  preset: ResumePreset
): Settings => ({
  themeColor: "#171717",
  themeColorTargets: {
    banner: false,
    name: false,
    sectionHeadings: false,
  },
  fontFamily: preset === "chinese" ? "NotoSansSC" : "Roboto",
  fontSize: "11",
  documentSize: preset === "chinese" ? "A4" : "Letter",
  autoFitOnePage: false,
  formToShow: {
    workExperiences: true,
    educations: true,
    projects: true,
    skills: true,
    custom: false,
  },
  formToHeading:
    preset === "chinese" ? CHINESE_FORM_HEADINGS : ENGLISH_FORM_HEADINGS,
  formsOrder: ["workExperiences", "educations", "projects", "skills", "custom"],
  showBulletPoints: {
    educations: true,
    projects: true,
    skills: true,
    custom: true,
  },
});

export const applyPresetToSettings = (
  settings: Settings,
  preset: ResumePreset
): Settings => {
  const defaults = createDefaultSettingsForPreset(preset);
  return {
    ...settings,
    fontFamily: defaults.fontFamily,
    documentSize: defaults.documentSize,
    formToHeading: defaults.formToHeading,
  };
};

export const getUntitledResumeTitleForPreset = (preset: ResumePreset) =>
  preset === "chinese"
    ? CHINESE_UNTITLED_RESUME_TITLE
    : ENGLISH_UNTITLED_RESUME_TITLE;

export const getResumeLanguageForPreset = (
  preset: ResumePreset
): ResumeLanguage => (preset === "chinese" ? "zh-CN" : "en");

export const isChineseResumePreset = (settings: Pick<Settings, "fontFamily">) =>
  ["NotoSansSC", "NotoSerifSC"].includes(settings.fontFamily);

const containsChineseCharacters = (value: string) =>
  /[\u3400-\u9FFF]/.test(value);

export const inferResumeLanguageFromSettings = (
  settings: Pick<Settings, "fontFamily" | "formToHeading">
): ResumeLanguage => {
  if (isChineseResumePreset(settings)) return "zh-CN";

  const headings = Object.values(settings.formToHeading ?? {});
  return headings.some((heading) => containsChineseCharacters(heading))
    ? "zh-CN"
    : "en";
};
