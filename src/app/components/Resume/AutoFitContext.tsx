"use client";

import { createContext, useContext } from "react";
import type { AutoFitStatus } from "components/Resume/auto-fit";
import type { ResumeLayout } from "components/Resume/ResumePDF/layout";

export type AutoFitContextValue = {
  effectiveLayout: ResumeLayout;
  fitStatus: AutoFitStatus;
  isComputing: boolean;
  recomputeAutoFit: () => Promise<ResumeLayout>;
  getLayoutForExport: () => Promise<ResumeLayout>;
};

export const AutoFitContext = createContext<AutoFitContextValue | null>(null);

export const useAutoFitContext = () => {
  const context = useContext(AutoFitContext);
  if (!context) {
    throw new Error("useAutoFitContext must be used within AutoFitProvider");
  }
  return context;
};
