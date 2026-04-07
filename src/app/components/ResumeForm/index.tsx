"use client";
import { useState } from "react";
import {
  useAppSelector,
  useSaveStateToLocalStorageOnChange,
  useSetInitialStore,
} from "lib/redux/hooks";
import { ShowForm, selectFormsOrder } from "lib/redux/settingsSlice";
import { ProfileForm } from "components/ResumeForm/ProfileForm";
import { WorkExperiencesForm } from "components/ResumeForm/WorkExperiencesForm";
import { EducationsForm } from "components/ResumeForm/EducationsForm";
import { ProjectsForm } from "components/ResumeForm/ProjectsForm";
import { SkillsForm } from "components/ResumeForm/SkillsForm";
import { ThemeForm } from "components/ResumeForm/ThemeForm";
import { CustomForm } from "components/ResumeForm/CustomForm";
import { useTranslation } from "components/AppPreferencesProvider";
import { cx } from "lib/cx";

const formTypeToComponent: { [type in ShowForm]: () => JSX.Element } = {
  workExperiences: WorkExperiencesForm,
  educations: EducationsForm,
  projects: ProjectsForm,
  skills: SkillsForm,
  custom: CustomForm,
};

export const ResumeForm = () => {
  const copy = useTranslation();
  useSetInitialStore();
  useSaveStateToLocalStorageOnChange();

  const formsOrder = useAppSelector(selectFormsOrder);
  const [isHover, setIsHover] = useState(false);

  return (
    <div
      className={cx(
        "h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent md:justify-end",
        isHover ? "scrollbar-thumb-slate-300" : "scrollbar-thumb-slate-200"
      )}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <section className="mx-auto flex w-full max-w-[44rem] flex-col gap-4 p-3 lg:p-4">
        <section className="border border-slate-300 bg-stone-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            {copy.builder.eyebrow}
          </p>
          <h1 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 lg:text-xl">
            {copy.builder.title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
            {copy.builder.description}
          </p>
        </section>
        <ProfileForm />
        {formsOrder.map((form) => {
          const Component = formTypeToComponent[form];
          return <Component key={form} />;
        })}
        <ThemeForm />
      </section>
    </div>
  );
};
