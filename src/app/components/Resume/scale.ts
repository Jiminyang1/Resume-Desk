import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  LETTER_HEIGHT_PX,
  LETTER_WIDTH_PX,
} from "lib/constants";

const MIN_RESUME_SCALE = 0.5;
const MAX_RESUME_SCALE = 1.5;

const roundScale = (value: number) => Math.round(value * 100) / 100;
const clampScale = (value: number) =>
  Math.min(Math.max(value, MIN_RESUME_SCALE), MAX_RESUME_SCALE);

export const getDefaultResumeScale = ({
  documentSize,
  availableHeightPx,
  availableWidthPx,
  additionalHeightPx = 0,
  additionalWidthPx = 0,
}: {
  documentSize: string;
  availableHeightPx: number;
  availableWidthPx: number;
  additionalHeightPx?: number;
  additionalWidthPx?: number;
}) => {
  const pageHeightPx =
    (documentSize === "A4" ? A4_HEIGHT_PX : LETTER_HEIGHT_PX) +
    additionalHeightPx;
  const pageWidthPx =
    (documentSize === "A4" ? A4_WIDTH_PX : LETTER_WIDTH_PX) +
    additionalWidthPx;

  if (availableHeightPx <= 0 || availableWidthPx <= 0) {
    return 0.8;
  }

  return roundScale(
    clampScale(
      Math.min(
        availableHeightPx / pageHeightPx,
        availableWidthPx / pageWidthPx
      )
    )
  );
};
