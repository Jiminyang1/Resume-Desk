export type AutoFitStatus =
  | "disabled"
  | "stale"
  | "applied"
  | "overflowAtLimit"
  | "error";

const MIN_LAYOUT_SCALE = 0.75;
const BASE_LAYOUT_SCALE = 1;
const FIT_SCALE_PRECISION = 0.001;
const DEFAULT_MAX_ITERATIONS = 9;
const FINAL_SCALE_BACKOFF_STEP = 0.005;

const roundScale = (value: number) => Math.round(value * 1000) / 1000;

const clampScale = (value: number, min: number, max: number) =>
  roundScale(Math.min(Math.max(value, min), max));

export const getAutoFitScaleBounds = () => ({
  minScale: roundScale(MIN_LAYOUT_SCALE),
  maxScale: BASE_LAYOUT_SCALE,
});

export const findBestFitScale = async ({
  minScale,
  maxScale,
  measurePageCount,
  preferredScale,
  maxIterations = DEFAULT_MAX_ITERATIONS,
}: {
  minScale: number;
  maxScale: number;
  measurePageCount: (scale: number) => Promise<number>;
  preferredScale?: number;
  maxIterations?: number;
}) => {
  const normalizedMinScale = Math.min(minScale, maxScale);
  const normalizedMaxScale = Math.max(minScale, maxScale);
  const normalizedPreferredScale =
    preferredScale === undefined
      ? undefined
      : clampScale(preferredScale, normalizedMinScale, normalizedMaxScale);

  const stabilizeScale = async (bestScale: number) => {
    let stabilizedScale = roundScale(bestScale);
    let stabilizedPageCount = await measurePageCount(stabilizedScale);

    while (
      stabilizedPageCount > 1 &&
      stabilizedScale > normalizedMinScale + FIT_SCALE_PRECISION
    ) {
      stabilizedScale = roundScale(
        Math.max(normalizedMinScale, stabilizedScale - FINAL_SCALE_BACKOFF_STEP)
      );
      stabilizedPageCount = await measurePageCount(stabilizedScale);
    }

    return {
      scale: stabilizedScale,
      fitStatus:
        stabilizedPageCount <= 1
          ? ("applied" as const)
          : ("overflowAtLimit" as const),
    };
  };

  const searchWithinRange = async ({
    low,
    high,
    bestScale,
  }: {
    low: number;
    high: number;
    bestScale: number;
  }) => {
    for (let idx = 0; idx < maxIterations; idx++) {
      if (high - low <= FIT_SCALE_PRECISION) break;

      const mid = roundScale((low + high) / 2);
      const pageCount = await measurePageCount(mid);

      if (pageCount <= 1) {
        bestScale = mid;
        low = mid;
      } else {
        high = mid;
      }
    }

    return stabilizeScale(bestScale);
  };

  if (
    normalizedPreferredScale !== undefined &&
    normalizedPreferredScale > normalizedMinScale &&
    normalizedPreferredScale < normalizedMaxScale
  ) {
    const preferredScalePageCount = await measurePageCount(
      normalizedPreferredScale
    );

    if (preferredScalePageCount <= 1) {
      const maxScalePageCount = await measurePageCount(normalizedMaxScale);
      if (maxScalePageCount <= 1) {
        return {
          scale: normalizedMaxScale,
          fitStatus: "applied" as const,
        };
      }

      return searchWithinRange({
        low: normalizedPreferredScale,
        high: normalizedMaxScale,
        bestScale: normalizedPreferredScale,
      });
    }

    const minScalePageCount = await measurePageCount(normalizedMinScale);
    if (minScalePageCount > 1) {
      return {
        scale: normalizedMinScale,
        fitStatus: "overflowAtLimit" as const,
      };
    }

    return searchWithinRange({
      low: normalizedMinScale,
      high: normalizedPreferredScale,
      bestScale: normalizedMinScale,
    });
  }

  const maxScalePageCount = await measurePageCount(normalizedMaxScale);
  if (maxScalePageCount <= 1) {
    return {
      scale: normalizedMaxScale,
      fitStatus: "applied" as const,
    };
  }

  const minScalePageCount = await measurePageCount(normalizedMinScale);
  if (minScalePageCount > 1) {
    return {
      scale: normalizedMinScale,
      fitStatus: "overflowAtLimit" as const,
    };
  }

  return searchWithinRange({
    low: normalizedMinScale,
    high: normalizedMaxScale,
    bestScale: normalizedMinScale,
  });
};
