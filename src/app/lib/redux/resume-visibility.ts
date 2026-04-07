type ResumeEntryWithVisibility = {
  visible?: boolean;
};

export const isResumeEntryVisible = <T extends ResumeEntryWithVisibility>(
  entry: T
) => entry.visible !== false;

export const getVisibleResumeEntries = <T extends ResumeEntryWithVisibility>(
  entries: T[]
) => entries.filter(isResumeEntryVisible);

export const hasVisibleResumeEntries = <T extends ResumeEntryWithVisibility>(
  entries: T[]
) => entries.some(isResumeEntryVisible);
