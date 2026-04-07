import { Fragment } from "react";
import type { Resume } from "lib/redux/types";
import { initialEducation, initialWorkExperience } from "lib/redux/resumeSlice";
import { deepClone } from "lib/deep-clone";
import { cx } from "lib/cx";
import { useTranslation } from "components/AppPreferencesProvider";

const TableRowHeader = ({ children }: { children: React.ReactNode }) => (
  <tr className="divide-x bg-gray-50">
    <th className="px-3 py-2 font-semibold" scope="colgroup" colSpan={2}>
      {children}
    </th>
  </tr>
);

const TableRow = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string | string[];
  className?: string | false;
}) => (
  <tr className={cx("divide-x", className)}>
    <th className="px-3 py-2 font-medium" scope="row">
      {label}
    </th>
    <td className="w-full px-3 py-2">
      {typeof value === "string"
        ? value
        : value.map((x, idx) => (
            <Fragment key={idx}>
              • {x}
              <br />
            </Fragment>
          ))}
    </td>
  </tr>
);

export const ResumeTable = ({ resume }: { resume: Resume }) => {
  const copy = useTranslation();
  const educations =
    resume.educations.length === 0
      ? [deepClone(initialEducation)]
      : resume.educations;
  const workExperiences =
    resume.workExperiences.length === 0
      ? [deepClone(initialWorkExperience)]
      : resume.workExperiences;
  const skills = [...resume.skills.descriptions];
  return (
    <table className="mt-2 w-full border text-sm text-gray-900">
      <tbody className="divide-y text-left align-top">
        <TableRowHeader>{copy.parser.table.profile}</TableRowHeader>
        <TableRow label={copy.parser.table.name} value={resume.profile.name} />
        <TableRow label={copy.parser.table.email} value={resume.profile.email} />
        <TableRow label={copy.parser.table.phone} value={resume.profile.phone} />
        <TableRow
          label={copy.parser.table.location}
          value={resume.profile.location}
        />
        <TableRow label={copy.parser.table.link} value={resume.profile.url} />
        <TableRow
          label={copy.parser.table.summary}
          value={resume.profile.summary}
        />
        <TableRowHeader>{copy.parser.table.education}</TableRowHeader>
        {educations.map((education, idx) => (
          <Fragment key={idx}>
            <TableRow label={copy.parser.table.school} value={education.school} />
            <TableRow label={copy.parser.table.degree} value={education.degree} />
            <TableRow label={copy.parser.table.gpa} value={education.gpa} />
            <TableRow label={copy.parser.table.date} value={education.date} />
            <TableRow
              label={copy.parser.table.descriptions}
              value={education.descriptions}
              className={
                educations.length - 1 !== 0 &&
                idx !== educations.length - 1 &&
                "!border-b-4"
              }
            />
          </Fragment>
        ))}
        <TableRowHeader>{copy.parser.table.workExperience}</TableRowHeader>
        {workExperiences.map((workExperience, idx) => (
          <Fragment key={idx}>
            <TableRow
              label={copy.parser.table.company}
              value={workExperience.company}
            />
            <TableRow
              label={copy.parser.table.jobTitle}
              value={workExperience.jobTitle}
            />
            <TableRow label={copy.parser.table.date} value={workExperience.date} />
            <TableRow
              label={copy.parser.table.descriptions}
              value={workExperience.descriptions}
              className={
                workExperiences.length - 1 !== 0 &&
                idx !== workExperiences.length - 1 &&
                "!border-b-4"
              }
            />
          </Fragment>
        ))}
        {resume.projects.length > 0 && (
          <TableRowHeader>{copy.parser.table.projects}</TableRowHeader>
        )}
        {resume.projects.map((project, idx) => (
          <Fragment key={idx}>
            <TableRow label={copy.parser.table.project} value={project.project} />
            <TableRow label={copy.parser.table.date} value={project.date} />
            <TableRow
              label={copy.parser.table.descriptions}
              value={project.descriptions}
              className={
                resume.projects.length - 1 !== 0 &&
                idx !== resume.projects.length - 1 &&
                "!border-b-4"
              }
            />
          </Fragment>
        ))}
        <TableRowHeader>{copy.parser.table.skills}</TableRowHeader>
        <TableRow label={copy.parser.table.descriptions} value={skills} />
      </tbody>
    </table>
  );
};
