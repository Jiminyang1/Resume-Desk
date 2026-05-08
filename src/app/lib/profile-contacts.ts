import type { ProfileContactType, ResumeProfileContact } from "lib/redux/types";

type LegacyProfileExtraDetail = {
  label?: string;
  value?: string;
  href?: string;
};

export type LegacyProfileContactFields = {
  email?: string;
  phone?: string;
  url?: string;
  location?: string;
  extraDetails?: LegacyProfileExtraDetail[];
};

export const PROFILE_CONTACT_TYPES: ProfileContactType[] = [
  "email",
  "phone",
  "link",
  "location",
  "linkedin",
  "github",
  "other",
];

export const DEFAULT_PROFILE_CONTACT_TYPE: ProfileContactType = "email";

export const createProfileContactId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const createProfileContact = (
  type: ProfileContactType = DEFAULT_PROFILE_CONTACT_TYPE
): ResumeProfileContact => ({
  id: createProfileContactId(),
  type,
  value: "",
});

export const getProfileContactHref = ({
  type,
  value,
}: Pick<ResumeProfileContact, "type" | "value">) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return undefined;

  switch (type) {
    case "email":
      return `mailto:${trimmedValue}`;
    case "phone":
      return `tel:${trimmedValue.replace(/[^\d+]/g, "")}`;
    case "link":
    case "linkedin":
    case "github":
      return /^https?:\/\//i.test(trimmedValue)
        ? trimmedValue
        : `https://${trimmedValue}`;
    default:
      return undefined;
  }
};

export const getVisibleProfileContacts = (contacts: ResumeProfileContact[]) =>
  contacts.filter((contact) => contact.value.trim().length > 0);

export const getProfileContactValueByType = (
  contacts: ResumeProfileContact[],
  types: ProfileContactType | ProfileContactType[]
) => {
  const typeList = Array.isArray(types) ? types : [types];
  return (
    contacts.find(
      (contact) =>
        typeList.includes(contact.type) && contact.value.trim().length > 0
    )?.value ?? ""
  );
};

export const normalizeProfileContacts = (
  contacts?: Partial<ResumeProfileContact>[]
) =>
  (contacts ?? [])
    .filter(
      (contact) => contact.type && PROFILE_CONTACT_TYPES.includes(contact.type)
    )
    .map((contact) => ({
      id: contact.id || createProfileContactId(),
      type: contact.type as ProfileContactType,
      value: contact.value ?? "",
    }));

const getLegacyUrlType = (value: string): ProfileContactType => {
  const normalizedValue = value.toLowerCase();
  if (/(^|\/\/|\.)github\.com(\/|$)/.test(normalizedValue)) return "github";
  if (/(^|\/\/|\.)linkedin\.com(\/|$)/.test(normalizedValue)) {
    return "linkedin";
  }
  return "link";
};

const getLegacyLabelType = (label: string): ProfileContactType => {
  const normalizedLabel = label.replace(/\s+/g, "").toLowerCase();
  if (normalizedLabel === "github") return "github";
  if (normalizedLabel === "linkedin") return "linkedin";
  return "other";
};

export const migrateLegacyProfileContacts = (
  profile: LegacyProfileContactFields & {
    contacts?: Partial<ResumeProfileContact>[];
  }
) => {
  if (profile.contacts) {
    return normalizeProfileContacts(profile.contacts);
  }

  const contacts: ResumeProfileContact[] = [];
  const addLegacyContact = (
    type: ProfileContactType,
    value: string | undefined,
    id: string
  ) => {
    const trimmedValue = value?.trim() ?? "";
    if (!trimmedValue) return;
    contacts.push({ id, type, value: trimmedValue });
  };

  addLegacyContact("email", profile.email, "legacy-email");
  addLegacyContact("phone", profile.phone, "legacy-phone");
  addLegacyContact(
    profile.url ? getLegacyUrlType(profile.url) : "link",
    profile.url,
    "legacy-link"
  );
  addLegacyContact("location", profile.location, "legacy-location");

  profile.extraDetails?.forEach((detail, idx) => {
    const label = detail.label?.trim() ?? "";
    const value = detail.value?.trim() || label;
    if (!value) return;

    contacts.push({
      id: `legacy-extra-${idx}`,
      type: getLegacyLabelType(label),
      value,
    });
  });

  return contacts;
};
