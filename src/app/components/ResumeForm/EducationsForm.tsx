import { useTranslation } from "components/AppPreferencesProvider";
import { Form, FormSection } from "components/ResumeForm/Form";
import {
  BulletListTextarea,
  Input,
} from "components/ResumeForm/Form/InputGroup";
import { BulletListIconButton } from "components/ResumeForm/Form/IconButton";
import type { CreateHandleChangeArgsWithDescriptions } from "components/ResumeForm/types";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import {
  changeEducations,
  changeSectionVisibility,
  selectEducations,
} from "lib/redux/resumeSlice";
import type { ResumeEducation } from "lib/redux/types";
import {
  changeShowBulletPoints,
  selectShowBulletPoints,
} from "lib/redux/settingsSlice";

export const EducationsForm = () => {
  const copy = useTranslation();
  const educations = useAppSelector(selectEducations);
  const dispatch = useAppDispatch();
  const showDelete = educations.length > 1;
  const form = "educations";
  const showBulletPoints = useAppSelector(selectShowBulletPoints(form));

  return (
    <Form form={form} addButtonText={copy.forms.education.add}>
      {educations.map(
        ({ school, degree, gpa, date, descriptions, visible }, idx) => {
          const handleEducationChange = (
            ...[
              field,
              value,
            ]: CreateHandleChangeArgsWithDescriptions<ResumeEducation>
          ) => {
            dispatch(changeEducations({ idx, field, value } as any));
          };

          const handleShowBulletPoints = (value: boolean) => {
            dispatch(changeShowBulletPoints({ field: form, value }));
          };
          const handleVisibilityChange = (value: boolean) => {
            dispatch(changeSectionVisibility({ form, idx, value }));
          };

          const showMoveUp = idx !== 0;
          const showMoveDown = idx !== educations.length - 1;
          const isVisible = visible !== false;

          return (
            <FormSection
              key={idx}
              form="educations"
              idx={idx}
              visible={isVisible}
              setVisible={handleVisibilityChange}
              showMoveUp={showMoveUp}
              showMoveDown={showMoveDown}
              showDelete={showDelete}
              deleteButtonTooltipText={copy.forms.deleteSchool}
            >
              <Input
                label={copy.forms.education.school}
                labelClassName="col-span-4"
                name="school"
                placeholder={copy.forms.education.schoolPlaceholder}
                value={school}
                onChange={handleEducationChange}
              />
              <Input
                label={copy.forms.education.date}
                labelClassName="col-span-2"
                name="date"
                placeholder={copy.forms.education.datePlaceholder}
                value={date}
                onChange={handleEducationChange}
              />
              <Input
                label={copy.forms.education.degree}
                labelClassName="col-span-4"
                name="degree"
                placeholder={copy.forms.education.degreePlaceholder}
                value={degree}
                onChange={handleEducationChange}
              />
              <Input
                label={copy.forms.education.gpa}
                labelClassName="col-span-2"
                name="gpa"
                placeholder={copy.forms.education.gpaPlaceholder}
                value={gpa}
                onChange={handleEducationChange}
              />
              <div className="relative col-span-full">
                <BulletListTextarea
                  label={copy.forms.education.info}
                  labelClassName="col-span-full"
                  name="descriptions"
                  placeholder={copy.forms.education.infoPlaceholder}
                  value={descriptions}
                  onChange={handleEducationChange}
                  showBulletPoints={showBulletPoints}
                />
                <div className="absolute left-[15.6rem] top-[0.07rem]">
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
