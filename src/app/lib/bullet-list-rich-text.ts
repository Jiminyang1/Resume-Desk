export type RichTextSegment = {
  text: string;
  bold: boolean;
};

const BOLD_MARKER = "**";
const escapeHTML = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const serializeNodeToMarkdown = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  if (node.tagName === "BR") {
    return "";
  }

  const serializedChildren = Array.from(node.childNodes)
    .map(serializeNodeToMarkdown)
    .join("");

  if (node.tagName === "B" || node.tagName === "STRONG") {
    return `${BOLD_MARKER}${serializedChildren}${BOLD_MARKER}`;
  }

  return serializedChildren;
};

export const getBulletListStringsFromHTML = (html: string) => {
  const container = document.createElement("div");
  container.innerHTML = html;

  const lineNodes =
    container.childNodes.length > 0
      ? Array.from(container.childNodes)
      : [document.createElement("div")];

  return lineNodes.map((node) => serializeNodeToMarkdown(node));
};

export const getHTMLFromBulletListStrings = (bulletListStrings: string[]) => {
  if (bulletListStrings.length === 0) {
    return "<div></div>";
  }

  return bulletListStrings
    .map((line) => `<div>${inlineBoldMarkdownToHTML(line)}</div>`)
    .join("");
};

export const inlineBoldMarkdownToHTML = (value: string) => {
  const escapedValue = escapeHTML(value);
  return escapedValue.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
};

export const getRichTextSegmentsFromMarkdown = (value: string) => {
  const segments: RichTextSegment[] = [];
  const boldPattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = boldPattern.exec(value)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: value.slice(lastIndex, match.index),
        bold: false,
      });
    }

    segments.push({
      text: match[1],
      bold: true,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) {
    segments.push({
      text: value.slice(lastIndex),
      bold: false,
    });
  }

  if (segments.length === 0) {
    return [{ text: value, bold: false }];
  }

  return segments;
};
