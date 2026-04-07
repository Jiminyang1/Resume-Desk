import {
  containsCjkText,
  getAvailableFontFamiliesForContent,
  getCompatibleFontFamilyForContent,
  getPdfFallbackFontFamily,
  getPdfHyphenationSegments,
} from "components/fonts/pdf-font-fallback";

describe("pdf font fallback", () => {
  it("maps serif english fonts to the serif chinese fallback", () => {
    expect(getPdfFallbackFontFamily("Lora")).toBe("NotoSerifSC");
  });

  it("maps sans english fonts to the sans chinese fallback", () => {
    expect(getPdfFallbackFontFamily("Roboto")).toBe("NotoSansSC");
  });

  it("detects chinese text inside nested content", () => {
    expect(
      containsCjkText({
        summary: "Backend开发",
        extras: ["GitHub", "项目经历"],
      })
    ).toBe(true);
  });

  it("limits chinese content to chinese font families", () => {
    expect(getAvailableFontFamiliesForContent("中文简历")).toEqual([
      "NotoSansSC",
      "NotoSerifSC",
    ]);
  });

  it("maps english serif selection to chinese serif font for chinese resumes", () => {
    expect(
      getCompatibleFontFamilyForContent({
        fontFamily: "Lora",
        content: "中文简历",
      })
    ).toBe("NotoSerifSC");
  });

  it("maps chinese serif selection back to an english serif font for english resumes", () => {
    expect(
      getCompatibleFontFamilyForContent({
        fontFamily: "NotoSerifSC",
        content: "English resume",
      })
    ).toBe("RobotoSlab");
  });

  it("splits chinese words character by character for wrapping", () => {
    expect(getPdfHyphenationSegments({ word: "中文" })).toEqual([
      "中",
      "",
      "文",
      "",
    ]);
  });

  it("keeps english words intact for wrapping", () => {
    expect(getPdfHyphenationSegments({ word: "Backend" })).toEqual([
      "Backend",
    ]);
  });
});
