import type { ResumeSkills } from "lib/redux/types";
import type { ResumeSectionToLines } from "lib/parse-resume-from-pdf/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

export const extractSkills = (sections: ResumeSectionToLines) => {
  const lines = getSectionLinesByKeywords(sections, ["skill"]);
  const descriptionsLineIdx = getDescriptionsLineIdx(lines);
  const leadingDescriptions =
    descriptionsLineIdx === undefined
      ? []
      : lines
          .slice(0, descriptionsLineIdx)
          .map((line) => line.map((item) => item.text).join(" ").trim())
          .filter(Boolean);
  const descriptionsLines =
    descriptionsLineIdx === undefined ? lines : lines.slice(descriptionsLineIdx);
  const descriptions = [
    ...leadingDescriptions,
    ...getBulletPointsFromLines(descriptionsLines),
  ];

  const skills: ResumeSkills = {
    descriptions,
  };

  return { skills };
};
