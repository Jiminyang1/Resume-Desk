import {
  getVisibleResumeEntries,
  hasVisibleResumeEntries,
  isResumeEntryVisible,
} from "lib/redux/resume-visibility";

describe("resume visibility helpers", () => {
  it("treats missing visibility as visible for backward compatibility", () => {
    expect(isResumeEntryVisible({})).toBe(true);
  });

  it("filters out entries that are explicitly hidden", () => {
    expect(
      getVisibleResumeEntries([
        { company: "OpenAI", visible: true },
        { company: "Hidden Inc", visible: false },
        { company: "Legacy Co" },
      ])
    ).toEqual([
      { company: "OpenAI", visible: true },
      { company: "Legacy Co" },
    ]);
  });

  it("reports whether a repeated section still has visible entries", () => {
    expect(
      hasVisibleResumeEntries([
        { visible: false },
        { visible: false },
      ])
    ).toBe(false);

    expect(
      hasVisibleResumeEntries([
        { visible: false },
        {},
      ])
    ).toBe(true);
  });
});
