"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist/types/src/display/api";
import { useTranslation } from "components/AppPreferencesProvider";
import { createResumePdfBlob } from "components/Resume/create-resume-pdf";
import {
  PREVIEW_FRAME_GUTTER_PX,
  PREVIEW_PAGE_GAP_PX,
} from "components/Resume/preview-chrome";
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  LETTER_HEIGHT_PX,
  LETTER_WIDTH_PX,
} from "lib/constants";
import type { ResumeLayout } from "components/Resume/ResumePDF/layout";
import type { Settings } from "lib/redux/settingsSlice";
import type { Resume } from "lib/redux/types";
import { loadPdfDocumentFromBlob } from "lib/pdfjs-browser";

const PREVIEW_RENDER_DEBOUNCE_MS = 200;

const getBasePageWidthPx = (documentSize: string) =>
  documentSize === "A4" ? A4_WIDTH_PX : LETTER_WIDTH_PX;

const getBasePageHeightPx = (documentSize: string) =>
  documentSize === "A4" ? A4_HEIGHT_PX : LETTER_HEIGHT_PX;

const isRenderCancelledError = (error: unknown) =>
  error instanceof Error && error.name === "RenderingCancelledException";

const PdfPageCanvas = ({
  pdfDocument,
  pageNumber,
  scale,
}: {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let isDisposed = false;
    let renderTask: RenderTask | null = null;

    const renderPage = async () => {
      const page = await pdfDocument.getPage(pageNumber);
      if (isDisposed) return;

      const displayViewport = page.getViewport({ scale });
      const outputScale = window.devicePixelRatio || 1;
      const renderViewport = page.getViewport({ scale: scale * outputScale });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = Math.ceil(renderViewport.width);
      canvas.height = Math.ceil(renderViewport.height);
      canvas.style.width = `${displayViewport.width}px`;
      canvas.style.height = `${displayViewport.height}px`;

      setDisplaySize({
        width: displayViewport.width,
        height: displayViewport.height,
      });

      renderTask = page.render({
        canvasContext: context as any,
        viewport: renderViewport,
      });

      try {
        await renderTask.promise;
      } catch (error) {
        if (!isRenderCancelledError(error)) {
          throw error;
        }
      }
    };

    void renderPage().catch((error) => {
      if (!isRenderCancelledError(error)) {
        console.error(`Failed to render preview page ${pageNumber}`, error);
      }
    });

    return () => {
      isDisposed = true;
      renderTask?.cancel();
    };
  }, [pageNumber, pdfDocument, scale]);

  return (
    <div
      className="overflow-hidden border border-slate-300 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.08),0_3px_10px_rgba(15,23,42,0.08)]"
      style={
        displaySize.width > 0
          ? {
              width: `${displaySize.width}px`,
              minHeight: `${displaySize.height}px`,
            }
          : undefined
      }
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};

const PdfCanvasPreview = ({
  blob,
  scale,
}: {
  blob: Blob;
  scale: number;
}) => {
  const copy = useTranslation();
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [loadError, setLoadError] = useState(false);
  const activeDocumentRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    let isDisposed = false;
    setLoadError(false);

    void loadPdfDocumentFromBlob(blob)
      .then((nextDocument) => {
        if (isDisposed) {
          void nextDocument.destroy();
          return;
        }

        setPdfDocument((currentDocument) => {
          if (currentDocument && currentDocument !== nextDocument) {
            void currentDocument.destroy();
          }

          activeDocumentRef.current = nextDocument;
          return nextDocument;
        });
      })
      .catch((error) => {
        if (!isDisposed) {
          console.error("Failed to load preview PDF", error);
          setLoadError(true);
        }
      });

    return () => {
      isDisposed = true;
    };
  }, [blob]);

  useEffect(
    () => () => {
      if (activeDocumentRef.current) {
        void activeDocumentRef.current.destroy();
        activeDocumentRef.current = null;
      }
    },
    []
  );

  if (loadError && !pdfDocument) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {copy.preview.renderError}
      </div>
    );
  }

  if (!pdfDocument) {
    return null;
  }

  return (
    <>
      {Array.from({ length: pdfDocument.numPages }, (_, index) => index + 1).map(
        (pageNumber) => (
          <PdfPageCanvas
            key={`${blob.size}-${pageNumber}`}
            pdfDocument={pdfDocument}
            pageNumber={pageNumber}
            scale={scale}
          />
        )
      )}
    </>
  );
};

const ResumePreview = ({
  resume,
  settings,
  layout,
  profilePhotoDataUrl,
  scale,
}: {
  resume: Resume;
  settings: Settings;
  layout: ResumeLayout;
  profilePhotoDataUrl?: string | null;
  scale: number;
}) => {
  const copy = useTranslation();
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasPreviewError, setHasPreviewError] = useState(false);
  const requestIdRef = useRef(0);
  const placeholderWidthPx = useMemo(
    () => getBasePageWidthPx(settings.documentSize) * scale,
    [scale, settings.documentSize]
  );
  const placeholderHeightPx = useMemo(
    () => getBasePageHeightPx(settings.documentSize) * scale,
    [scale, settings.documentSize]
  );

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsGenerating(true);
    setHasPreviewError(false);
    let isDisposed = false;

    const timeoutId = window.setTimeout(() => {
      void createResumePdfBlob({
        resume,
        settings,
        layout,
        profilePhotoDataUrl,
      })
        .then((blob) => {
          if (isDisposed || requestIdRef.current !== requestId) return;
          setPreviewBlob(blob);
        })
        .catch((error) => {
          if (isDisposed || requestIdRef.current !== requestId) return;

          console.error("Failed to generate preview PDF", error);
          setHasPreviewError(true);
        })
        .finally(() => {
          if (!isDisposed && requestIdRef.current === requestId) {
            setIsGenerating(false);
          }
        });
    }, PREVIEW_RENDER_DEBOUNCE_MS);

    return () => {
      isDisposed = true;
      window.clearTimeout(timeoutId);
    };
  }, [layout, profilePhotoDataUrl, resume, settings]);

  return (
    <div className="relative flex justify-center">
      <div
        className="flex flex-col items-center"
        style={{
          gap: `${PREVIEW_PAGE_GAP_PX}px`,
          padding: `${PREVIEW_PAGE_GAP_PX}px ${PREVIEW_FRAME_GUTTER_PX}px`,
        }}
      >
        {previewBlob ? (
          <PdfCanvasPreview blob={previewBlob} scale={scale} />
        ) : (
          <div
            className="flex items-center justify-center border border-dashed border-slate-300 bg-white text-sm text-slate-500 shadow-sm"
            style={{
              width: `${placeholderWidthPx}px`,
              minHeight: `${placeholderHeightPx}px`,
            }}
          >
            {hasPreviewError ? copy.preview.renderError : copy.common.loading}
          </div>
        )}
      </div>
      {isGenerating && previewBlob ? (
        <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-slate-900/85 px-3 py-1 text-xs font-medium text-white shadow-sm">
          {copy.preview.updating}
        </div>
      ) : null}
    </div>
  );
};

export const ResumePreviewCSR = dynamic(() => Promise.resolve(ResumePreview), {
  ssr: false,
});
