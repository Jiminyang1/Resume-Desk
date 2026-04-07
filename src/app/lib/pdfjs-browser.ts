import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

let hasConfiguredPdfJsWorker = false;

export const configurePdfJsWorker = () => {
  if (hasConfiguredPdfJsWorker || typeof window === "undefined") return;

  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  hasConfiguredPdfJsWorker = true;
};

export const loadPdfDocumentFromBlob = async (
  blob: Blob
): Promise<PDFDocumentProxy> => {
  configurePdfJsWorker();
  const data = new Uint8Array(await blob.arrayBuffer());
  return pdfjs.getDocument({ data }).promise;
};
