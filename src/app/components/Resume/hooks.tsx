import { useEffect } from "react";
import type { RefObject } from "react";
import { getPxPerRem } from "lib/get-px-per-rem";
import { CSS_VARIABLES } from "globals-css";
import { getDefaultResumeScale } from "components/Resume/scale";
import {
  PREVIEW_FRAME_GUTTER_PX,
  PREVIEW_PAGE_GAP_PX,
} from "components/Resume/preview-chrome";

/**
 * useSetDefaultScale sets the initial scale of the resume preview.
 *
 * It runs on first paint and when the document size changes, fitting the page
 * within the available preview area without keeping a persistent autoscale mode.
 */
export const useSetDefaultScale = ({
  setScale,
  documentSize,
  containerRef,
}: {
  setScale: (scale: number) => void;
  documentSize: string;
  containerRef?: RefObject<HTMLElement>;
}) => {
  useEffect(() => {
    const getDefaultScale = () => {
      const container = containerRef?.current;

      if (container) {
        const computedStyle = window.getComputedStyle(container);
        const horizontalPaddingPx =
          parseFloat(computedStyle.paddingLeft) +
          parseFloat(computedStyle.paddingRight);
        const verticalPaddingPx =
          parseFloat(computedStyle.paddingTop) +
          parseFloat(computedStyle.paddingBottom);

        return getDefaultResumeScale({
          documentSize,
          availableHeightPx: container.clientHeight - verticalPaddingPx,
          availableWidthPx: container.clientWidth - horizontalPaddingPx,
          additionalHeightPx: PREVIEW_PAGE_GAP_PX * 2,
          additionalWidthPx: PREVIEW_FRAME_GUTTER_PX * 2,
        });
      }

      const screenHeightPx = window.innerHeight;
      const PX_PER_REM = getPxPerRem();
      const screenHeightRem = screenHeightPx / PX_PER_REM;
      const topNavBarHeightRem = parseFloat(
        CSS_VARIABLES["--top-nav-bar-height"]
      );
      const resumeControlBarHeight = parseFloat(
        CSS_VARIABLES["--resume-control-bar-height"]
      );
      const resumePadding = parseFloat(CSS_VARIABLES["--resume-padding"]);
      const topAndBottomResumePadding = resumePadding * 2 * PX_PER_REM;

      return getDefaultResumeScale({
        documentSize,
        availableHeightPx:
          screenHeightPx -
          (topNavBarHeightRem + resumeControlBarHeight) * PX_PER_REM -
          topAndBottomResumePadding,
        availableWidthPx: window.innerWidth,
        additionalHeightPx: PREVIEW_PAGE_GAP_PX * 2,
        additionalWidthPx: PREVIEW_FRAME_GUTTER_PX * 2,
      });
    };

    setScale(getDefaultScale());
  }, [containerRef, setScale, documentSize]);
};
