import { deepClone } from "lib/deep-clone";
import {
  cloneProfilePhotoAsset,
  deleteProfilePhotoAsset,
} from "lib/profile-photo-storage";
import {
  createDefaultResume,
  createDefaultSettingsForPreset,
  getUntitledResumeTitleForPreset,
  getResumeLanguageForPreset,
  inferResumeLanguageFromSettings,
  isChineseResumePreset,
  type ResumeLanguage,
  type ResumePreset,
} from "lib/resume-presets";
import type { Settings } from "lib/redux/settingsSlice";
import type { RootState } from "lib/redux/store";
import type { Resume } from "lib/redux/types";

const CURRENT_RESUME_STORAGE_KEY = "open-resume-state";
const RESUME_MANAGER_STORAGE_KEY = "open-resume-manager";

export type StoredResumeSnapshot = Pick<RootState, "resume" | "settings">;
export type StoredResumeSource = "scratch" | "imported";

export interface SavedResume {
  id: string;
  title: string;
  language: ResumeLanguage;
  source: StoredResumeSource;
  createdAt: string;
  updatedAt: string;
  resume: Resume;
  settings: Settings;
}

type StoredSavedResume = Omit<SavedResume, "language"> & {
  language?: ResumeLanguage;
};

export interface ResumeManagerState {
  currentResumeId: string | null;
  resumes: SavedResume[];
}

type StoredResumeManagerState = Omit<ResumeManagerState, "resumes"> & {
  resumes: StoredSavedResume[];
};

const readFromLocalStorage = <T>(key: string) => {
  if (typeof window === "undefined") return undefined;

  try {
    const stringifiedState = localStorage.getItem(key);
    if (!stringifiedState) return undefined;
    return JSON.parse(stringifiedState) as T;
  } catch {
    return undefined;
  }
};

const writeToLocalStorage = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;

  try {
    const stringifiedState = JSON.stringify(value);
    localStorage.setItem(key, stringifiedState);
  } catch {
    // Ignore
  }
};

const removeFromLocalStorage = (key: string) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
};

const normalizeResume = (resume: Partial<Resume>) => {
  const defaults = createDefaultResume();

  return {
    ...defaults,
    ...resume,
    profile: {
      ...defaults.profile,
      ...resume.profile,
      photoAssetId: resume.profile?.photoAssetId ?? defaults.profile.photoAssetId,
      extraDetails: resume.profile?.extraDetails ?? defaults.profile.extraDetails,
    },
    workExperiences: resume.workExperiences ?? defaults.workExperiences,
    educations: resume.educations ?? defaults.educations,
    projects: resume.projects ?? defaults.projects,
    skills: {
      ...defaults.skills,
      ...resume.skills,
      descriptions:
        resume.skills?.descriptions ?? defaults.skills.descriptions,
    },
    custom: {
      ...defaults.custom,
      ...resume.custom,
      descriptions:
        resume.custom?.descriptions ?? defaults.custom.descriptions,
    },
  } as Resume;
};

const normalizeSettings = (settings: Partial<Settings>) => {
  const defaults = createDefaultSettingsForPreset("english");

  return {
    ...defaults,
    ...settings,
    themeColorTargets: {
      ...defaults.themeColorTargets,
      ...settings.themeColorTargets,
    },
    formToShow: {
      ...defaults.formToShow,
      ...settings.formToShow,
    },
    formToHeading: {
      ...defaults.formToHeading,
      ...settings.formToHeading,
    },
    formsOrder: settings.formsOrder ?? defaults.formsOrder,
    showBulletPoints: {
      ...defaults.showBulletPoints,
      ...settings.showBulletPoints,
    },
  } as Settings;
};

const normalizeStoredResumeSnapshot = (
  snapshot?: StoredResumeSnapshot
): StoredResumeSnapshot | undefined => {
  if (!snapshot?.resume || !snapshot?.settings) return undefined;

  return {
    resume: normalizeResume(snapshot.resume),
    settings: normalizeSettings(snapshot.settings),
  };
};

const normalizeSavedResume = (savedResume: StoredSavedResume): SavedResume => {
  const settings = normalizeSettings(savedResume.settings);

  return {
    ...savedResume,
    language:
      savedResume.language ?? inferResumeLanguageFromSettings(settings),
    resume: normalizeResume(savedResume.resume),
    settings,
  };
};

const getUntitledResumeTitleForSettings = (settings: Settings) =>
  isChineseResumePreset(settings)
    ? getUntitledResumeTitleForPreset("chinese")
    : getUntitledResumeTitleForPreset("english");

const getResumeTitle = ({
  resume,
  fallbackTitle,
}: {
  resume: Resume;
  fallbackTitle?: string;
}) => {
  const profileName = resume.profile.name.trim();
  return (
    profileName ||
    fallbackTitle?.trim() ||
    getUntitledResumeTitleForPreset("english")
  );
};

const getDuplicateResumeTitle = (
  title: string,
  language: ResumeLanguage
) => {
  const trimmedTitle = title.trim();
  const copyLabel = language === "zh-CN" ? "副本" : "Copy";
  const untitledTitle =
    language === "zh-CN"
      ? getUntitledResumeTitleForPreset("chinese")
      : getUntitledResumeTitleForPreset("english");

  if (!trimmedTitle) {
    return `${untitledTitle} ${copyLabel}`;
  }
  return trimmedTitle.endsWith(copyLabel)
    ? `${trimmedTitle} 2`
    : `${trimmedTitle} ${copyLabel}`;
};

const createResumeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `resume-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const createStoredResume = ({
  resume,
  settings,
  source,
  title,
  language,
}: {
  resume: Resume;
  settings: Settings;
  source: StoredResumeSource;
  title?: string;
  language?: ResumeLanguage;
}): SavedResume => {
  const now = new Date().toISOString();
  const normalizedResume = normalizeResume(resume);
  const normalizedSettings = normalizeSettings(settings);
  const fallbackTitle = title ?? getUntitledResumeTitleForSettings(normalizedSettings);

  return {
    id: createResumeId(),
    title: getResumeTitle({
      resume: normalizedResume,
      fallbackTitle,
    }),
    language:
      language ?? inferResumeLanguageFromSettings(normalizedSettings),
    source,
    createdAt: now,
    updatedAt: now,
    resume: deepClone(normalizedResume),
    settings: deepClone(normalizedSettings),
  };
};

const loadCurrentResumeSnapshot = () =>
  normalizeStoredResumeSnapshot(
    readFromLocalStorage<StoredResumeSnapshot>(CURRENT_RESUME_STORAGE_KEY)
  );

const saveCurrentResumeSnapshot = (snapshot: StoredResumeSnapshot) => {
  writeToLocalStorage(CURRENT_RESUME_STORAGE_KEY, snapshot);
};

const normalizeResumeManagerState = (
  resumeManagerState?: StoredResumeManagerState
): ResumeManagerState | undefined => {
  if (!resumeManagerState || !Array.isArray(resumeManagerState.resumes)) {
    return undefined;
  }

  const resumes = resumeManagerState.resumes.map(normalizeSavedResume);
  const currentResumeId = resumes.some(
    (resume) => resume.id === resumeManagerState.currentResumeId
  )
    ? resumeManagerState.currentResumeId
    : resumes[0]?.id ?? null;

  return {
    currentResumeId,
    resumes,
  };
};

const saveResumeManagerState = (resumeManagerState: ResumeManagerState) => {
  writeToLocalStorage(RESUME_MANAGER_STORAGE_KEY, resumeManagerState);
};

const loadStoredResumeManagerState = () =>
  normalizeResumeManagerState(
    readFromLocalStorage<StoredResumeManagerState>(RESUME_MANAGER_STORAGE_KEY)
  );

const saveResumeToManager = (snapshot: StoredResumeSnapshot) => {
  const resumeManagerState = loadResumeManagerFromLocalStorage();
  const currentResumeId = resumeManagerState.currentResumeId;

  if (!currentResumeId) {
    const savedResume = createStoredResume({
      ...snapshot,
      source: "scratch",
    });
    saveResumeManagerState({
      currentResumeId: savedResume.id,
      resumes: [savedResume, ...resumeManagerState.resumes],
    });
    return;
  }

  let hasFoundCurrentResume = false;
  const resumes = resumeManagerState.resumes.map((savedResume) => {
    if (savedResume.id !== currentResumeId) return savedResume;

    hasFoundCurrentResume = true;
    return {
      ...savedResume,
      title: getResumeTitle({
        resume: snapshot.resume,
        fallbackTitle: savedResume.title,
      }),
      language: savedResume.language,
      updatedAt: new Date().toISOString(),
      resume: deepClone(snapshot.resume),
      settings: deepClone(snapshot.settings),
    };
  });

  if (!hasFoundCurrentResume) {
    const savedResume = createStoredResume({
      ...snapshot,
      source: "scratch",
    });
    saveResumeManagerState({
      currentResumeId: savedResume.id,
      resumes: [savedResume, ...resumes],
    });
    return;
  }

  saveResumeManagerState({
    currentResumeId,
    resumes,
  });
};

export const loadStateFromLocalStorage = () => {
  const currentSnapshot = loadCurrentResumeSnapshot();
  if (currentSnapshot) return currentSnapshot;

  const resumeManagerState = loadStoredResumeManagerState();
  if (!resumeManagerState?.currentResumeId) return undefined;

  const currentResume = resumeManagerState.resumes.find(
    (resume) => resume.id === resumeManagerState.currentResumeId
  );
  if (!currentResume) return undefined;

  return {
    resume: currentResume.resume,
    settings: currentResume.settings,
  };
};

export const saveStateToLocalStorage = (state: RootState) => {
  const snapshot = {
    resume: deepClone(state.resume),
    settings: deepClone(state.settings),
  };

  saveCurrentResumeSnapshot(snapshot);
  saveResumeToManager(snapshot);
};

export const loadResumeManagerFromLocalStorage = (): ResumeManagerState => {
  const storedResumeManagerState = loadStoredResumeManagerState();
  if (storedResumeManagerState) {
    return storedResumeManagerState;
  }

  const currentSnapshot = loadCurrentResumeSnapshot();
  if (!currentSnapshot) {
    return {
      currentResumeId: null,
      resumes: [],
    };
  }

  const migratedResume = createStoredResume({
    ...currentSnapshot,
    source: "scratch",
  });
  const migratedResumeManagerState = {
    currentResumeId: migratedResume.id,
    resumes: [migratedResume],
  };

  saveResumeManagerState(migratedResumeManagerState);

  return migratedResumeManagerState;
};

export const createNewResumeInLocalStorage = ({
  preset = "english",
}: {
  preset?: ResumePreset;
} = {}) => {
  const savedResume = createStoredResume({
    resume: createDefaultResume(),
    settings: createDefaultSettingsForPreset(preset),
    source: "scratch",
    title: getUntitledResumeTitleForPreset(preset),
    language: getResumeLanguageForPreset(preset),
  });
  const resumeManagerState = loadResumeManagerFromLocalStorage();

  saveResumeManagerState({
    currentResumeId: savedResume.id,
    resumes: [savedResume, ...resumeManagerState.resumes],
  });
  saveCurrentResumeSnapshot({
    resume: savedResume.resume,
    settings: savedResume.settings,
  });

  return savedResume;
};

export const createImportedResumeInLocalStorage = ({
  resume,
  settings,
  title,
}: {
  resume: Resume;
  settings: Settings;
  title?: string;
}) => {
  const savedResume = createStoredResume({
    resume,
    settings,
    source: "imported",
    title,
  });
  const resumeManagerState = loadResumeManagerFromLocalStorage();

  saveResumeManagerState({
    currentResumeId: savedResume.id,
    resumes: [savedResume, ...resumeManagerState.resumes],
  });
  saveCurrentResumeSnapshot({
    resume: savedResume.resume,
    settings: savedResume.settings,
  });

  return savedResume;
};

export const openResumeInLocalStorage = (resumeId: string) => {
  const resumeManagerState = loadResumeManagerFromLocalStorage();
  const savedResume = resumeManagerState.resumes.find(
    (resume) => resume.id === resumeId
  );
  if (!savedResume) return undefined;

  saveResumeManagerState({
    ...resumeManagerState,
    currentResumeId: resumeId,
  });
  saveCurrentResumeSnapshot({
    resume: savedResume.resume,
    settings: savedResume.settings,
  });

  return savedResume;
};

export const duplicateResumeInLocalStorage = async (
  resumeId: string
) => {
  const resumeManagerState = loadResumeManagerFromLocalStorage();
  const savedResume = resumeManagerState.resumes.find(
    (resume) => resume.id === resumeId
  );
  if (!savedResume) return undefined;

  const duplicatedResumeData = deepClone(savedResume.resume);
  const clonedPhotoAssetId = await cloneProfilePhotoAsset(
    duplicatedResumeData.profile.photoAssetId
  );

  if (duplicatedResumeData.profile.photoAssetId) {
    duplicatedResumeData.profile.photoAssetId =
      clonedPhotoAssetId ?? duplicatedResumeData.profile.photoAssetId;
  }

  const duplicatedResume = createStoredResume({
    resume: duplicatedResumeData,
    settings: savedResume.settings,
    source: savedResume.source,
    title: getDuplicateResumeTitle(savedResume.title, savedResume.language),
    language: savedResume.language,
  });

  saveResumeManagerState({
    currentResumeId: duplicatedResume.id,
    resumes: [duplicatedResume, ...resumeManagerState.resumes],
  });
  saveCurrentResumeSnapshot({
    resume: duplicatedResume.resume,
    settings: duplicatedResume.settings,
  });

  return duplicatedResume;
};

export const deleteResumeFromLocalStorage = async (resumeId: string) => {
  const resumeManagerState = loadResumeManagerFromLocalStorage();
  const resumeToDelete = resumeManagerState.resumes.find(
    (resume) => resume.id === resumeId
  );
  const resumes = resumeManagerState.resumes.filter(
    (resume) => resume.id !== resumeId
  );
  const nextCurrentResumeId =
    resumeManagerState.currentResumeId === resumeId
      ? resumes[0]?.id ?? null
      : resumeManagerState.currentResumeId;

  saveResumeManagerState({
    currentResumeId: nextCurrentResumeId,
    resumes,
  });

  if (!nextCurrentResumeId) {
    removeFromLocalStorage(CURRENT_RESUME_STORAGE_KEY);
  } else {
    const currentResume = resumes.find(
      (resume) => resume.id === nextCurrentResumeId
    );
    if (currentResume) {
      saveCurrentResumeSnapshot({
        resume: currentResume.resume,
        settings: currentResume.settings,
      });
    }
  }

  const photoAssetId = resumeToDelete?.resume.profile.photoAssetId;
  const isPhotoStillUsed = photoAssetId
    ? resumes.some((resume) => resume.resume.profile.photoAssetId === photoAssetId)
    : false;

  if (photoAssetId && !isPhotoStillUsed) {
    await deleteProfilePhotoAsset(photoAssetId);
  }
};

export const getHasUsedAppBefore = () => {
  const resumeManagerState = loadResumeManagerFromLocalStorage();
  return (
    resumeManagerState.resumes.length > 0 ||
    Boolean(loadCurrentResumeSnapshot())
  );
};
