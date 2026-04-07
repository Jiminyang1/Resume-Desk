import { getDefaultResumeScale } from "components/Resume/scale";

describe("getDefaultResumeScale", () => {
  it("fits the page by height when height is the tighter constraint", () => {
    const scale = getDefaultResumeScale({
      documentSize: "Letter",
      availableHeightPx: 1056,
      availableWidthPx: 1200,
    });

    expect(scale).toBe(1);
  });

  it("fits the page by width when width is the tighter constraint", () => {
    const scale = getDefaultResumeScale({
      documentSize: "Letter",
      availableHeightPx: 1500,
      availableWidthPx: 408,
    });

    expect(scale).toBe(0.5);
  });

  it("clamps oversized layouts to the zoom slider maximum", () => {
    const scale = getDefaultResumeScale({
      documentSize: "A4",
      availableHeightPx: 5000,
      availableWidthPx: 5000,
    });

    expect(scale).toBe(1.5);
  });

  it("accounts for preview chrome when fitting by width", () => {
    const scale = getDefaultResumeScale({
      documentSize: "Letter",
      availableHeightPx: 1500,
      availableWidthPx: 864,
      additionalWidthPx: 48,
    });

    expect(scale).toBe(1);
  });
});
