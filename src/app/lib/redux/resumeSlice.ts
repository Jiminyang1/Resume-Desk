import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "lib/redux/store";
import type {
  Resume,
  ResumeEducation,
  ResumeProfileExtraDetail,
  ResumeProfile,
  ResumeProject,
  ResumeSkills,
  ResumeWorkExperience,
} from "lib/redux/types";
import type { ShowForm } from "lib/redux/settingsSlice";

type RepeatableForm = Exclude<ShowForm, "skills" | "custom">;

export const initialProfile: ResumeProfile = {
  name: "",
  summary: "",
  email: "",
  phone: "",
  location: "",
  url: "",
  photoAssetId: null,
  extraDetails: [],
};

export const initialWorkExperience: ResumeWorkExperience = {
  visible: true,
  company: "",
  jobTitle: "",
  date: "",
  descriptions: [],
};

export const initialEducation: ResumeEducation = {
  visible: true,
  school: "",
  degree: "",
  gpa: "",
  date: "",
  descriptions: [],
};

export const initialProject: ResumeProject = {
  visible: true,
  project: "",
  date: "",
  descriptions: [],
};

export const initialSkills: ResumeSkills = {
  descriptions: [],
};

export const initialCustom = {
  descriptions: [],
};

export const initialResumeState: Resume = {
  profile: initialProfile,
  workExperiences: [initialWorkExperience],
  educations: [initialEducation],
  projects: [initialProject],
  skills: initialSkills,
  custom: initialCustom,
};

// Keep the field & value type in sync with CreateHandleChangeArgsWithDescriptions (components\ResumeForm\types.ts)
export type CreateChangeActionWithDescriptions<T> = {
  idx: number;
} & (
  | {
      field: Exclude<keyof T, "descriptions" | "visible">;
      value: string;
    }
  | { field: "descriptions"; value: string[] }
);

export const resumeSlice = createSlice({
  name: "resume",
  initialState: initialResumeState,
  reducers: {
    changeProfile: (
      draft,
      action: PayloadAction<
        | {
            field: Exclude<keyof ResumeProfile, "photoAssetId" | "extraDetails">;
            value: string;
          }
        | { field: "photoAssetId"; value: string | null }
      >
    ) => {
      const { field, value } = action.payload;
      draft.profile[field] = value as never;
    },
    addProfileExtraDetail: (draft) => {
      draft.profile.extraDetails.push({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `detail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: "",
        value: "",
        href: "",
      });
    },
    changeProfileExtraDetail: (
      draft,
      action: PayloadAction<{
        idx: number;
        field: keyof Omit<ResumeProfileExtraDetail, "id">;
        value: string;
      }>
    ) => {
      const { idx, field, value } = action.payload;
      const detail = draft.profile.extraDetails[idx];
      if (!detail) return;
      detail[field] = value;
    },
    deleteProfileExtraDetail: (
      draft,
      action: PayloadAction<{ idx: number }>
    ) => {
      draft.profile.extraDetails.splice(action.payload.idx, 1);
    },
    changeWorkExperiences: (
      draft,
      action: PayloadAction<
        CreateChangeActionWithDescriptions<ResumeWorkExperience>
      >
    ) => {
      const { idx, field, value } = action.payload;
      const workExperience = draft.workExperiences[idx];
      workExperience[field] = value as any;
    },
    changeEducations: (
      draft,
      action: PayloadAction<CreateChangeActionWithDescriptions<ResumeEducation>>
    ) => {
      const { idx, field, value } = action.payload;
      const education = draft.educations[idx];
      education[field] = value as any;
    },
    changeProjects: (
      draft,
      action: PayloadAction<CreateChangeActionWithDescriptions<ResumeProject>>
    ) => {
      const { idx, field, value } = action.payload;
      const project = draft.projects[idx];
      project[field] = value as any;
    },
    changeSkills: (
      draft,
      action: PayloadAction<{ field: "descriptions"; value: string[] }>
    ) => {
      const { value } = action.payload;
      draft.skills.descriptions = value;
    },
    changeCustom: (
      draft,
      action: PayloadAction<{ field: "descriptions"; value: string[] }>
    ) => {
      const { value } = action.payload;
      draft.custom.descriptions = value;
    },
    addSectionInForm: (draft, action: PayloadAction<{ form: ShowForm }>) => {
      const { form } = action.payload;
      switch (form) {
        case "workExperiences": {
          draft.workExperiences.push(structuredClone(initialWorkExperience));
          return draft;
        }
        case "educations": {
          draft.educations.push(structuredClone(initialEducation));
          return draft;
        }
        case "projects": {
          draft.projects.push(structuredClone(initialProject));
          return draft;
        }
      }
    },
    moveSectionInForm: (
      draft,
      action: PayloadAction<{
        form: RepeatableForm;
        idx: number;
        direction: "up" | "down";
      }>
    ) => {
      const { form, idx, direction } = action.payload;
      if (
        (idx === 0 && direction === "up") ||
        (idx === draft[form].length - 1 && direction === "down")
      ) {
        return draft;
      }

      const section = draft[form][idx];
      if (direction === "up") {
        draft[form][idx] = draft[form][idx - 1];
        draft[form][idx - 1] = section;
      } else {
        draft[form][idx] = draft[form][idx + 1];
        draft[form][idx + 1] = section;
      }
    },
    changeSectionVisibility: (
      draft,
      action: PayloadAction<{
        form: RepeatableForm;
        idx: number;
        value: boolean;
      }>
    ) => {
      const { form, idx, value } = action.payload;
      draft[form][idx].visible = value;
    },
    deleteSectionInFormByIdx: (
      draft,
      action: PayloadAction<{ form: RepeatableForm; idx: number }>
    ) => {
      const { form, idx } = action.payload;
      draft[form].splice(idx, 1);
    },
    setResume: (draft, action: PayloadAction<Resume>) => {
      return action.payload;
    },
  },
});

export const {
  changeProfile,
  addProfileExtraDetail,
  changeProfileExtraDetail,
  deleteProfileExtraDetail,
  changeWorkExperiences,
  changeEducations,
  changeProjects,
  changeSkills,
  changeCustom,
  addSectionInForm,
  moveSectionInForm,
  changeSectionVisibility,
  deleteSectionInFormByIdx,
  setResume,
} = resumeSlice.actions;

export const selectResume = (state: RootState) => state.resume;
export const selectProfile = (state: RootState) => state.resume.profile;
export const selectWorkExperiences = (state: RootState) =>
  state.resume.workExperiences;
export const selectEducations = (state: RootState) => state.resume.educations;
export const selectProjects = (state: RootState) => state.resume.projects;
export const selectSkills = (state: RootState) => state.resume.skills;
export const selectCustom = (state: RootState) => state.resume.custom;

export default resumeSlice.reducer;
