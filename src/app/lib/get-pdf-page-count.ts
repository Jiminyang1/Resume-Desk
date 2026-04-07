import { findLastInkRow } from "lib/pdf-page-metrics";
import { loadPdfDocumentFromBlob } from "lib/pdfjs-browser";

const PDF_RENDER_SCALE = 2;

const roundTo = (value: number, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export const getPdfPageMetrics = async (blob: Blob) => {
  const pdfFile = await loadPdfDocumentFromBlob(blob);

  try {
    const pageCount = pdfFile.numPages;
    if (pageCount !== 1 || typeof document === "undefined") {
      return {
        pageCount,
        bottomGapPt: -1,
      };
    }

    const page = await pdfFile.getPage(1);
    const pageHeightPt = page.view[3] - page.view[1];
    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    const context = canvas.getContext("2d");
    if (!context) {
      return {
        pageCount,
        bottomGapPt: 0,
      };
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context as any, viewport }).promise;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const lastInkRow = findLastInkRow(
      imageData.data,
      imageData.width,
      imageData.height
    );
    const pxPerPt = viewport.height / pageHeightPt;
    const bottomGapPt =
      lastInkRow === -1
        ? roundTo(pageHeightPt)
        : roundTo((canvas.height - 1 - lastInkRow) / pxPerPt);

    return {
      pageCount,
      bottomGapPt,
    };
  } finally {
    await pdfFile.destroy();
  }
};

export const getPdfPageCount = async (blob: Blob) => {
  const pdfFile = await loadPdfDocumentFromBlob(blob);

  try {
    return pdfFile.numPages;
  } finally {
    await pdfFile.destroy();
  }
};
