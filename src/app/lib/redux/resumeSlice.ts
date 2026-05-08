import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "lib/redux/store";
import type {
  Resume,
  ResumeEducation,
  ResumeProfile,
  ResumeProfileContact,
  ResumeProject,
  ResumeSkills,
  ResumeWorkExperience,
} from "lib/redux/types";
import type { ShowForm } from "lib/redux/settingsSlice";
import { createProfileContact } from "lib/profile-contacts";

type RepeatableForm = Exclude<ShowForm, "skills" | "custom">;

export const initialProfile: ResumeProfile = {
  name: "",
  summary: "",
  photoAssetId: null,
  contacts: [],
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
            field: Exclude<keyof ResumeProfile, "photoAssetId" | "contacts">;
            value: string;
          }
        | { field: "photoAssetId"; value: string | null }
      >
    ) => {
      const { field, value } = action.payload;
      draft.profile[field] = value as never;
    },
    addProfileContact: (
      draft,
      action: PayloadAction<{ type?: ResumeProfileContact["type"] } | undefined>
    ) => {
      draft.profile.contacts.push(createProfileContact(action.payload?.type));
    },
    changeProfileContact: (
      draft,
      action: PayloadAction<
        | {
            idx: number;
            field: "type";
            value: ResumeProfileContact["type"];
          }
        | {
            idx: number;
            field: "value";
            value: string;
          }
      >
    ) => {
      const { idx, field, value } = action.payload;
      const contact = draft.profile.contacts[idx];
      if (!contact) return;
      if (field === "type") {
        contact.type = value;
      } else {
        contact.value = value;
      }
    },
    deleteProfileContact: (draft, action: PayloadAction<{ idx: number }>) => {
      draft.profile.contacts.splice(action.payload.idx, 1);
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
  addProfileContact,
  changeProfileContact,
  deleteProfileContact,
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
