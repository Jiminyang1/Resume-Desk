export interface ResumeProfileExtraDetail {
  id: string;
  label: string;
  value: string;
  href?: string;
}

export interface ResumeProfile {
  name: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: string;
  photoAssetId: string | null;
  extraDetails: ResumeProfileExtraDetail[];
}

export interface ResumeWorkExperience {
  visible?: boolean;
  company: string;
  jobTitle: string;
  date: string;
  descriptions: string[];
}

export interface ResumeEducation {
  visible?: boolean;
  school: string;
  degree: string;
  date: string;
  gpa: string;
  descriptions: string[];
}

export interface ResumeProject {
  visible?: boolean;
  project: string;
  date: string;
  descriptions: string[];
}

export interface ResumeSkills {
  descriptions: string[];
}

export interface ResumeCustom {
  descriptions: string[];
}

export interface Resume {
  profile: ResumeProfile;
  workExperiences: ResumeWorkExperience[];
  educations: ResumeEducation[];
  projects: ResumeProject[];
  skills: ResumeSkills;
  custom: ResumeCustom;
}

export type ResumeKey = keyof Resume;
