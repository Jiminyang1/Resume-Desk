import {
  createNewResumeInLocalStorage,
  deleteResumeFromLocalStorage,
  duplicateResumeInLocalStorage,
  loadResumeManagerFromLocalStorage,
  loadStateFromLocalStorage,
  saveStateToLocalStorage,
} from "lib/redux/local-storage";
import type { RootState } from "lib/redux/store";

const initialResumeState = {
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
};

const initialSettings = {
  themeColor: "#171717",
  themeColorTargets: {
    banner: false,
    name: false,
    sectionHeadings: false,
  },
  fontFamily: "Roboto",
  fontSize: "11",
  documentSize: "Letter",
  autoFitOnePage: false,
  formToShow: {
    workExperiences: true,
    educations: true,
    projects: true,
    skills: true,
    custom: false,
  },
  formToHeading: {
    workExperiences: "WORK EXPERIENCE",
    educations: "EDUCATION",
    projects: "PROJECT",
    skills: "SKILLS",
    custom: "CUSTOM SECTION",
  },
  formsOrder: ["workExperiences", "educations", "projects", "skills", "custom"],
  showBulletPoints: {
    educations: true,
    projects: true,
    skills: true,
    custom: true,
  },
};

const createRootState = ({
  resume = initialResumeState,
  settings = initialSettings,
}: Partial<RootState> = {}) =>
  ({
    resume,
    settings,
  }) as RootState;

describe("local storage resume manager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("migrates a legacy current resume into the resume library", () => {
    localStorage.setItem(
      "open-resume-state",
      JSON.stringify(
        createRootState({
          resume: {
            ...initialResumeState,
            profile: {
              ...initialResumeState.profile,
              name: "Legacy Resume",
            },
          },
        })
      )
    );

    const resumeManagerState = loadResumeManagerFromLocalStorage();

    expect(resumeManagerState.resumes).toHaveLength(1);
    expect(resumeManagerState.currentResumeId).toBe(
      resumeManagerState.resumes[0].id
    );
    expect(resumeManagerState.resumes[0].title).toBe("Legacy Resume");
    expect(resumeManagerState.resumes[0].language).toBe("en");
    expect(
      JSON.parse(localStorage.getItem("open-resume-manager") || "{}")
    ).toMatchObject({
      currentResumeId: resumeManagerState.currentResumeId,
    });
  });

  it("infers language for legacy saved resumes missing the language field", () => {
    localStorage.setItem(
      "open-resume-manager",
      JSON.stringify({
        currentResumeId: "legacy-chinese",
        resumes: [
          {
            id: "legacy-chinese",
            title: "中文简历",
            source: "scratch",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            resume: initialResumeState,
            settings: {
              ...initialSettings,
              fontFamily: "NotoSansSC",
              documentSize: "A4",
              formToHeading: {
                workExperiences: "工作经历",
                educations: "教育经历",
                projects: "项目经历",
                skills: "技能",
                custom: "自定义栏目",
              },
            },
          },
        ],
      })
    );

    const resumeManagerState = loadResumeManagerFromLocalStorage();

    expect(resumeManagerState.resumes[0].language).toBe("zh-CN");
  });

  it("creates a new resume and makes it the current draft", () => {
    const savedResume = createNewResumeInLocalStorage();

    const resumeManagerState = loadResumeManagerFromLocalStorage();
    const currentSnapshot = loadStateFromLocalStorage();

    expect(resumeManagerState.resumes).toHaveLength(1);
    expect(resumeManagerState.currentResumeId).toBe(savedResume.id);
    expect(currentSnapshot).toEqual({
      resume: savedResume.resume,
      settings: savedResume.settings,
    });
    expect(savedResume.title).toBe("Untitled Resume");
    expect(savedResume.settings.themeColor).toBe("#171717");
    expect(savedResume.settings.themeColorTargets).toEqual({
      banner: false,
      name: false,
      sectionHeadings: false,
    });
    expect(savedResume.resume.profile.photoAssetId).toBeNull();
    expect(savedResume.resume.profile.extraDetails).toEqual([]);
    expect(savedResume.language).toBe("en");
  });

  it("creates a new chinese preset resume", () => {
    const savedResume = createNewResumeInLocalStorage({ preset: "chinese" });

    expect(savedResume.title).toBe("未命名简历");
    expect(savedResume.language).toBe("zh-CN");
    expect(savedResume.settings.documentSize).toBe("A4");
    expect(savedResume.settings.fontFamily).toBe("NotoSansSC");
    expect(savedResume.settings.formToHeading.workExperiences).toBe("工作经历");
  });

  it("syncs builder edits back into the currently selected saved resume", () => {
    createNewResumeInLocalStorage();

    saveStateToLocalStorage(
      createRootState({
        resume: {
          ...initialResumeState,
          profile: {
            ...initialResumeState.profile,
            name: "Jane Doe",
          },
        },
      })
    );

    const resumeManagerState = loadResumeManagerFromLocalStorage();

    expect(resumeManagerState.resumes).toHaveLength(1);
    expect(resumeManagerState.resumes[0].title).toBe("Jane Doe");
    expect(resumeManagerState.resumes[0].resume.profile.name).toBe("Jane Doe");
  });

  it("duplicates resumes and falls back to the next draft after delete", async () => {
    const originalResume = createNewResumeInLocalStorage();
    const duplicatedResume = await duplicateResumeInLocalStorage(
      originalResume.id
    );

    expect(duplicatedResume).toBeDefined();

    let resumeManagerState = loadResumeManagerFromLocalStorage();
    expect(resumeManagerState.resumes).toHaveLength(2);
    expect(resumeManagerState.currentResumeId).toBe(duplicatedResume?.id);

    await deleteResumeFromLocalStorage(duplicatedResume!.id);

    resumeManagerState = loadResumeManagerFromLocalStorage();
    expect(resumeManagerState.resumes).toHaveLength(1);
    expect(resumeManagerState.currentResumeId).toBe(originalResume.id);
    expect(loadStateFromLocalStorage()).toEqual({
      resume: originalResume.resume,
      settings: originalResume.settings,
    });
  });

  it("duplicates resumes without changing their language", async () => {
    const originalResume = createNewResumeInLocalStorage({ preset: "chinese" });
    const duplicatedResume = await duplicateResumeInLocalStorage(originalResume.id);

    expect(duplicatedResume?.language).toBe("zh-CN");
    expect(duplicatedResume?.settings.documentSize).toBe("A4");
    expect(duplicatedResume?.settings.fontFamily).toBe("NotoSansSC");
    expect(duplicatedResume?.title).toContain("副本");
  });
});
