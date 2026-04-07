import {
  getBulletListStringsFromHTML,
  getHTMLFromBulletListStrings,
  getRichTextSegmentsFromMarkdown,
} from "lib/bullet-list-rich-text";

describe("bullet list rich text", () => {
  it("serializes bold HTML into markdown markers", () => {
    expect(
      getBulletListStringsFromHTML(
        "<div>Built <strong>high-impact</strong> features</div>"
      )
    ).toEqual(["Built **high-impact** features"]);
  });

  it("renders markdown markers back into strong tags", () => {
    expect(
      getHTMLFromBulletListStrings(["Built **high-impact** features"])
    ).toBe("<div>Built <strong>high-impact</strong> features</div>");
  });

  it("splits markdown into normal and bold rich-text segments", () => {
    expect(
      getRichTextSegmentsFromMarkdown("Built **high-impact** features")
    ).toEqual([
      { text: "Built ", bold: false },
      { text: "high-impact", bold: true },
      { text: " features", bold: false },
    ]);
  });
});
