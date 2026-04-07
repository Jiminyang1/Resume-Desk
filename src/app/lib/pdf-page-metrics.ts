const MIN_INK_PIXELS_PER_ROW = 8;
const WHITE_PIXEL_THRESHOLD = 245;
const INK_ALPHA_THRESHOLD = 12;

const isInkPixel = (
  red: number,
  green: number,
  blue: number,
  alpha: number
) =>
  alpha > INK_ALPHA_THRESHOLD &&
  (red < WHITE_PIXEL_THRESHOLD ||
    green < WHITE_PIXEL_THRESHOLD ||
    blue < WHITE_PIXEL_THRESHOLD);

export const findLastInkRow = (
  pixelData: Uint8ClampedArray,
  width: number,
  height: number
) => {
  for (let row = height - 1; row >= 0; row -= 1) {
    let inkPixelCount = 0;
    const rowOffset = row * width * 4;

    for (let col = 0; col < width; col += 1) {
      const pixelOffset = rowOffset + col * 4;
      const red = pixelData[pixelOffset];
      const green = pixelData[pixelOffset + 1];
      const blue = pixelData[pixelOffset + 2];
      const alpha = pixelData[pixelOffset + 3];

      if (!isInkPixel(red, green, blue, alpha)) continue;

      inkPixelCount += 1;
      if (inkPixelCount >= MIN_INK_PIXELS_PER_ROW) {
        return row;
      }
    }
  }

  return -1;
};
