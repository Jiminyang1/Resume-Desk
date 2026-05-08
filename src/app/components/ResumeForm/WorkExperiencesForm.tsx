import { useTranslation } from "components/AppPreferencesProvider";
import { Form, FormSection } from "components/ResumeForm/Form";
import {
  Input,
  BulletListTextarea,
} from "components/ResumeForm/Form/InputGroup";
import { BulletListIconButton } from "components/ResumeForm/Form/IconButton";
import type { CreateHandleChangeArgsWithDescriptions } from "components/ResumeForm/types";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import {
  changeSectionVisibility,
  changeWorkExperiences,
  selectWorkExperiences,
} from "lib/redux/resumeSlice";
import type { ResumeWorkExperience } from "lib/redux/types";
import {
  changeShowBulletPoints,
  selectShowBulletPoints,
} from "lib/redux/settingsSlice";

export const WorkExperiencesForm = () => {
  const copy = useTranslation();
  const workExperiences = useAppSelector(selectWorkExperiences);
  const dispatch = useAppDispatch();
  const form = "workExperiences";
  const showBulletPoints = useAppSelector(selectShowBulletPoints(form));

  const showDelete = workExperiences.length > 1;

  return (
    <Form form={form} addButtonText={copy.forms.work.add}>
      {workExperiences.map(
        ({ company, jobTitle, date, descriptions, visible }, idx) => {
          const handleWorkExperienceChange = (
            ...[
              field,
              value,
            ]: CreateHandleChangeArgsWithDescriptions<ResumeWorkExperience>
          ) => {
            // TS doesn't support passing union type to single call signature
            // https://github.com/microsoft/TypeScript/issues/54027
            // any is used here as a workaround
            dispatch(changeWorkExperiences({ idx, field, value } as any));
          };
          const handleVisibilityChange = (value: boolean) => {
            dispatch(
              changeSectionVisibility({
                form,
                idx,
                value,
              })
            );
          };
          const handleShowBulletPoints = (value: boolean) => {
            dispatch(changeShowBulletPoints({ field: form, value }));
          };
          const showMoveUp = idx !== 0;
          const showMoveDown = idx !== workExperiences.length - 1;
          const isVisible = visible !== false;

          return (
            <FormSection
              key={idx}
              form={form}
              idx={idx}
              visible={isVisible}
              setVisible={handleVisibilityChange}
              showMoveUp={showMoveUp}
              showMoveDown={showMoveDown}
              showDelete={showDelete}
              deleteButtonTooltipText={copy.forms.deleteJob}
            >
              <Input
                label={copy.forms.work.company}
                labelClassName="col-span-full"
                name="company"
                placeholder={copy.forms.work.companyPlaceholder}
                value={company}
                onChange={handleWorkExperienceChange}
              />
              <Input
                label={copy.forms.work.jobTitle}
                labelClassName="col-span-4"
                name="jobTitle"
                placeholder={copy.forms.work.jobTitlePlaceholder}
                value={jobTitle}
                onChange={handleWorkExperienceChange}
              />
              <Input
                label={copy.forms.work.date}
                labelClassName="col-span-2"
                name="date"
                placeholder={copy.forms.work.datePlaceholder}
                value={date}
                onChange={handleWorkExperienceChange}
              />
              <div className="relative col-span-full">
                <BulletListTextarea
                  label={copy.forms.work.description}
                  labelClassName="col-span-full"
                  name="descriptions"
                  placeholder={copy.forms.work.descriptionPlaceholder}
                  value={descriptions}
                  onChange={handleWorkExperienceChange}
                  showBulletPoints={showBulletPoints}
                />
                <div className="absolute left-[5.7rem] top-[0.07rem]">
                  <BulletListIconButton
                    showBulletPoints={showBulletPoints}
                    onClick={handleShowBulletPoints}
                  />
                </div>
              </div>
            </FormSection>
          );
        }
      )}
    </Form>
  );
};
