import { findLastInkRow } from "lib/pdf-page-metrics";

describe("findLastInkRow", () => {
  it("returns the last row that contains enough non-white pixels", () => {
    const width = 12;
    const height = 6;
    const pixelData = new Uint8ClampedArray(width * height * 4).fill(255);

    for (let col = 0; col < 8; col += 1) {
      const pixelOffset = (4 * width + col) * 4;
      pixelData[pixelOffset] = 0;
      pixelData[pixelOffset + 1] = 0;
      pixelData[pixelOffset + 2] = 0;
      pixelData[pixelOffset + 3] = 255;
    }

    expect(findLastInkRow(pixelData, width, height)).toBe(4);
  });

  it("ignores tiny anti-aliasing noise near the bottom edge", () => {
    const width = 12;
    const height = 6;
    const pixelData = new Uint8ClampedArray(width * height * 4).fill(255);

    for (let col = 0; col < 4; col += 1) {
      const noisyPixelOffset = (5 * width + col) * 4;
      pixelData[noisyPixelOffset] = 240;
      pixelData[noisyPixelOffset + 1] = 240;
      pixelData[noisyPixelOffset + 2] = 240;
      pixelData[noisyPixelOffset + 3] = 255;
    }

    for (let col = 0; col < 8; col += 1) {
      const realInkOffset = (3 * width + col) * 4;
      pixelData[realInkOffset] = 0;
      pixelData[realInkOffset + 1] = 0;
      pixelData[realInkOffset + 2] = 0;
      pixelData[realInkOffset + 3] = 255;
    }

    expect(findLastInkRow(pixelData, width, height)).toBe(3);
  });
});
