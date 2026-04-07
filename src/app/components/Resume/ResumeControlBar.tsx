"use client";
import { type RefObject } from "react";
import { useTranslation } from "components/AppPreferencesProvider";
import { useSetDefaultScale } from "components/Resume/hooks";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";

const ResumeControlBar = ({
  scale,
  setScale,
  documentSize,
  onDownload,
  isDownloading,
  previewContainerRef,
}: {
  scale: number;
  setScale: (scale: number) => void;
  documentSize: string;
  onDownload: () => Promise<void>;
  isDownloading: boolean;
  previewContainerRef?: RefObject<HTMLElement>;
}) => {
  const copy = useTranslation();
  useSetDefaultScale({
    setScale,
    documentSize,
    containerRef: previewContainerRef,
  });

  return (
    <div className="flex min-h-[var(--resume-control-bar-height)] flex-col gap-2 text-sm text-slate-700 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2.5">
        <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.01}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="w-32 accent-slate-900 lg:w-36"
        />
        <div className="w-12 text-sm tabular-nums">{`${Math.round(
          scale * 100
        )}%`}</div>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-2 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-default disabled:opacity-40"
          onClick={() => setScale(1)}
          disabled={Math.abs(scale - 1) < 0.01}
          title={copy.preview.resetZoom}
          aria-label={copy.preview.resetZoom}
        >
          <ArrowPathIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>100%</span>
        </button>
      </div>
      <button
        type="button"
        className="btn-secondary h-9 self-start px-2.5 text-sm lg:self-auto"
        onClick={() => {
          void onDownload();
        }}
        disabled={isDownloading}
      >
        <ArrowDownTrayIcon className="h-4 w-4" />
        <span className="whitespace-nowrap">
          {isDownloading ? copy.common.loading : copy.preview.downloadResume}
        </span>
      </button>
    </div>
  );
};

/**
 * Load ResumeControlBar client side because it depends on browser sizing APIs.
 */
export const ResumeControlBarCSR = dynamic(
  () => Promise.resolve(ResumeControlBar),
  {
    ssr: false,
  }
);
