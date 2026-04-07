import { useTranslation } from "components/AppPreferencesProvider";
import { Form, FormSection } from "components/ResumeForm/Form";
import {
  Input,
  BulletListTextarea,
} from "components/ResumeForm/Form/InputGroup";
import type { CreateHandleChangeArgsWithDescriptions } from "components/ResumeForm/types";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import {
  changeProjects,
  changeSectionVisibility,
  selectProjects,
} from "lib/redux/resumeSlice";
import type { ResumeProject } from "lib/redux/types";

export const ProjectsForm = () => {
  const copy = useTranslation();
  const projects = useAppSelector(selectProjects);
  const dispatch = useAppDispatch();
  const showDelete = projects.length > 1;

  return (
    <Form form="projects" addButtonText={copy.forms.projects.add}>
      {projects.map(({ project, date, descriptions, visible }, idx) => {
        const handleProjectChange = (
          ...[
            field,
            value,
          ]: CreateHandleChangeArgsWithDescriptions<ResumeProject>
        ) => {
          dispatch(changeProjects({ idx, field, value } as any));
        };
        const handleVisibilityChange = (value: boolean) => {
          dispatch(changeSectionVisibility({ form: "projects", idx, value }));
        };
        const showMoveUp = idx !== 0;
        const showMoveDown = idx !== projects.length - 1;
        const isVisible = visible !== false;

        return (
          <FormSection
            key={idx}
            form="projects"
            idx={idx}
            visible={isVisible}
            setVisible={handleVisibilityChange}
            showMoveUp={showMoveUp}
            showMoveDown={showMoveDown}
            showDelete={showDelete}
            deleteButtonTooltipText={copy.forms.deleteProject}
          >
            <Input
              name="project"
              label={copy.forms.projects.projectName}
              placeholder={copy.forms.projects.projectPlaceholder}
              value={project}
              onChange={handleProjectChange}
              labelClassName="col-span-4"
            />
            <Input
              name="date"
              label={copy.forms.projects.date}
              placeholder={copy.forms.projects.datePlaceholder}
              value={date}
              onChange={handleProjectChange}
              labelClassName="col-span-2"
            />
            <BulletListTextarea
              name="descriptions"
              label={copy.forms.projects.description}
              placeholder={copy.forms.projects.descriptionPlaceholder}
              value={descriptions}
              onChange={handleProjectChange}
              labelClassName="col-span-full"
            />
          </FormSection>
        );
      })}
    </Form>
  );
};
