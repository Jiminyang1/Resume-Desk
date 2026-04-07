import {
  buildResumeLayout,
  getBaseBodyFontSizePt,
  MAX_BODY_FONT_SIZE_PT,
  MAX_MANUAL_BODY_FONT_SIZE_PT,
  MIN_BODY_FONT_SIZE_PT,
} from "components/Resume/ResumePDF/layout";

describe("buildResumeLayout", () => {
  it("preserves the current manual layout defaults at scale 1", () => {
    const layout = buildResumeLayout({ fontSize: "11" });

    expect(layout.bodyFontSizePt).toBe(11);
    expect(layout.nameFontSizePt).toBe(20);
    expect(layout.pagePaddingTopPt).toBe(0);
    expect(layout.pagePaddingBottomPt).toBe(0);
    expect(layout.autoFitBottomReservePt).toBe(0);
    expect(layout.pagePaddingXPt).toBe(60);
    expect(layout.sectionMarginTopPt).toBe(15);
    expect(layout.sectionGapPt).toBe(6);
    expect(layout.lineHeight).toBe(1.3);
  });

  it("clamps ATS-sensitive layout values when auto-fit boundaries are enabled", () => {
    const compactLayout = buildResumeLayout({
      fontSize: "14",
      fitScale: 0.6,
      enforceAtsBoundaries: true,
    });
    const expandedLayout = buildResumeLayout({
      fontSize: "8",
      fitScale: 1.6,
      enforceAtsBoundaries: true,
    });

    expect(compactLayout.bodyFontSizePt).toBe(8.4);
    expect(compactLayout.pagePaddingTopPt).toBe(5);
    expect(compactLayout.pagePaddingBottomPt).toBe(22);
    expect(compactLayout.autoFitBottomReservePt).toBe(8);
    expect(compactLayout.pagePaddingXPt).toBe(42);
    expect(compactLayout.sectionGapPt).toBe(4);
    expect(compactLayout.lineHeight).toBe(1.18);

    expect(expandedLayout.bodyFontSizePt).toBe(12.8);
    expect(expandedLayout.pagePaddingTopPt).toBe(9.6);
    expect(expandedLayout.pagePaddingBottomPt).toBe(32);
    expect(expandedLayout.autoFitBottomReservePt).toBe(8);
    expect(expandedLayout.pagePaddingXPt).toBe(72);
    expect(expandedLayout.nameFontSizePt).toBe(24);
    expect(expandedLayout.iconSizePt).toBe(14.5);
  });

  it("preserves larger manual font sizes when auto-fit is off", () => {
    expect(buildResumeLayout({ fontSize: "18" }).bodyFontSizePt).toBe(18);
  });

  it("caps absurd manual font sizes before rendering the page", () => {
    expect(
      getBaseBodyFontSizePt("999", {
        maxBodyFontSizePt: MAX_MANUAL_BODY_FONT_SIZE_PT,
      })
    ).toBe(MAX_MANUAL_BODY_FONT_SIZE_PT);
    expect(buildResumeLayout({ fontSize: "999" }).bodyFontSizePt).toBe(
      MAX_MANUAL_BODY_FONT_SIZE_PT
    );
  });

  it("preserves the chosen auto-fit starting size while the ATS range stays available for warnings", () => {
    expect(buildResumeLayout({
      fontSize: "18",
      enforceAtsBoundaries: true,
    }).bodyFontSizePt).toBe(18);

    expect(
      getBaseBodyFontSizePt("18", {
        maxBodyFontSizePt: MAX_MANUAL_BODY_FONT_SIZE_PT,
      })
    ).toBe(18);

    expect(MIN_BODY_FONT_SIZE_PT).toBe(9.5);
    expect(MAX_BODY_FONT_SIZE_PT).toBe(12);
  });
});
