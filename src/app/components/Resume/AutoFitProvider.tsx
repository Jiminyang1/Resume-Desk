"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AutoFitContext,
} from "components/Resume/AutoFitContext";
import {
  useRegisterReactPDFFont,
  useRegisterReactPDFHyphenationCallback,
} from "components/fonts/hooks";
import {
  type AutoFitStatus,
} from "components/Resume/auto-fit";
import {
  getManualResumeLayout,
  resolveAutoFitLayout,
} from "components/Resume/resolve-auto-fit-layout";
import type { ResumeLayout } from "components/Resume/ResumePDF/layout";
import { useProfilePhotoDataUrl } from "lib/hooks/useProfilePhotoDataUrl";
import { useAppSelector } from "lib/redux/hooks";
import { selectResume } from "lib/redux/resumeSlice";
import { selectSettings } from "lib/redux/settingsSlice";

const AUTO_FIT_COMPUTE_DEBOUNCE_MS = 250;

const getAutoFitConfigSignature = ({
  fontFamily,
  fontSize,
  documentSize,
  formToShow,
  formToHeading,
  formsOrder,
  showBulletPoints,
  hasProfilePhoto,
}: {
  fontFamily: string;
  fontSize: string;
  documentSize: string;
  formToShow: Record<string, boolean>;
  formToHeading: Record<string, string>;
  formsOrder: string[];
  showBulletPoints: Record<string, boolean>;
  hasProfilePhoto: boolean;
}) =>
  JSON.stringify({
    fontFamily,
    fontSize,
    documentSize,
    formToShow,
    formToHeading,
    formsOrder,
    showBulletPoints,
    hasProfilePhoto,
  });

export const AutoFitProvider = ({ children }: { children: React.ReactNode }) => {
  const resume = useAppSelector(selectResume);
  const settings = useAppSelector(selectSettings);
  const profilePhotoDataUrl = useProfilePhotoDataUrl(resume.profile.photoAssetId);

  useRegisterReactPDFFont();
  useRegisterReactPDFHyphenationCallback();

  const manualLayout = useMemo(
    () => getManualResumeLayout(settings),
    [settings]
  );
  const [effectiveLayout, setEffectiveLayout] = useState(manualLayout);
  const [fitStatus, setFitStatus] = useState<AutoFitStatus>("disabled");
  const [isComputing, setIsComputing] = useState(false);
  const effectiveLayoutRef = useRef(manualLayout);
  const fitStatusRef = useRef<AutoFitStatus>("disabled");
  const latestInputsRef = useRef({
    manualLayout,
    profilePhotoDataUrl,
    resume,
    settings,
  });
  const lastResolvedScaleRef = useRef<number | null>(null);
  const previousResumeRef = useRef(resume);
  const previousConfigSignatureRef = useRef<string | null>(null);
  const timeoutIdRef = useRef<number | null>(null);
  const pendingFitPromiseRef = useRef<Promise<ResumeLayout> | null>(null);
  const requestIdRef = useRef(0);
  const autoFitConfigSignature = useMemo(
    () =>
      getAutoFitConfigSignature({
        fontFamily: settings.fontFamily,
        fontSize: settings.fontSize,
        documentSize: settings.documentSize,
        formToShow: settings.formToShow,
        formToHeading: settings.formToHeading,
        formsOrder: settings.formsOrder,
        showBulletPoints: settings.showBulletPoints,
        hasProfilePhoto: Boolean(profilePhotoDataUrl),
      }),
    [
      profilePhotoDataUrl,
      settings.documentSize,
      settings.fontFamily,
      settings.fontSize,
      settings.formToHeading,
      settings.formToShow,
      settings.formsOrder,
      settings.showBulletPoints,
    ]
  );

  useEffect(() => {
    effectiveLayoutRef.current = effectiveLayout;
  }, [effectiveLayout]);

  useEffect(() => {
    fitStatusRef.current = fitStatus;
  }, [fitStatus]);

  useEffect(() => {
    latestInputsRef.current = {
      manualLayout,
      profilePhotoDataUrl,
      resume,
      settings,
    };
  }, [manualLayout, profilePhotoDataUrl, resume, settings]);

  const cancelPendingAutoFit = useCallback(() => {
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    requestIdRef.current += 1;
    pendingFitPromiseRef.current = null;
    setIsComputing(false);
  }, []);

  const runAutoFitComputation = useCallback(
    ({
      debounceMs = 0,
      preferredScale,
    }: {
      debounceMs?: number;
      preferredScale?: number | null;
    } = {}) => {
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setIsComputing(true);

      const execute = async () => {
        try {
          const { resume, settings, profilePhotoDataUrl, manualLayout } =
            latestInputsRef.current;
          const resolvedLayout = await resolveAutoFitLayout({
            resume,
            settings,
            profilePhotoDataUrl,
            preferredScale: preferredScale ?? lastResolvedScaleRef.current,
          });

          if (requestIdRef.current !== requestId) return manualLayout;

          lastResolvedScaleRef.current = resolvedLayout.scale;
          setEffectiveLayout(resolvedLayout.layout);
          setFitStatus(resolvedLayout.fitStatus);
          return resolvedLayout.layout;
        } catch (error) {
          const { manualLayout } = latestInputsRef.current;
          if (requestIdRef.current !== requestId) return manualLayout;

          console.error("Failed to auto-fit resume to one page", error);
          setEffectiveLayout(manualLayout);
          setFitStatus("error");
          return manualLayout;
        } finally {
          if (requestIdRef.current === requestId) {
            timeoutIdRef.current = null;
            pendingFitPromiseRef.current = null;
            setIsComputing(false);
          }
        }
      };

      if (debounceMs > 0) {
        const fitPromise = new Promise<ResumeLayout>((resolve) => {
          timeoutIdRef.current = window.setTimeout(() => {
            timeoutIdRef.current = null;
            void execute().then(resolve);
          }, debounceMs);
        });
        pendingFitPromiseRef.current = fitPromise;
        return fitPromise;
      }

      const fitPromise = execute();
      pendingFitPromiseRef.current = fitPromise;
      return fitPromise;
    },
    []
  );

  const recomputeAutoFit = useCallback(() => {
    if (!latestInputsRef.current.settings.autoFitOnePage) {
      const { manualLayout } = latestInputsRef.current;
      setEffectiveLayout(manualLayout);
      setFitStatus("disabled");
      return Promise.resolve(manualLayout);
    }

    return runAutoFitComputation({
      preferredScale: lastResolvedScaleRef.current,
    });
  }, [runAutoFitComputation]);

  const getLayoutForExport = useCallback(async () => {
    const { manualLayout, settings } = latestInputsRef.current;

    if (!settings.autoFitOnePage) {
      return manualLayout;
    }

    if (fitStatusRef.current === "stale" || fitStatusRef.current === "error") {
      return recomputeAutoFit();
    }

    if (pendingFitPromiseRef.current) {
      return pendingFitPromiseRef.current;
    }

    return effectiveLayoutRef.current;
  }, [recomputeAutoFit]);

  useEffect(() => {
    if (!settings.autoFitOnePage) {
      cancelPendingAutoFit();
      previousConfigSignatureRef.current = autoFitConfigSignature;
      lastResolvedScaleRef.current = null;
      setEffectiveLayout(manualLayout);
      setFitStatus("disabled");
    }
  }, [
    autoFitConfigSignature,
    cancelPendingAutoFit,
    manualLayout,
    settings.autoFitOnePage,
  ]);

  useEffect(() => {
    if (!settings.autoFitOnePage) return;

    const previousSignature = previousConfigSignatureRef.current;
    previousConfigSignatureRef.current = autoFitConfigSignature;

    if (
      previousSignature === autoFitConfigSignature &&
      fitStatusRef.current !== "disabled"
    ) {
      return;
    }

    void runAutoFitComputation({
      debounceMs: AUTO_FIT_COMPUTE_DEBOUNCE_MS,
      preferredScale: lastResolvedScaleRef.current,
    });
  }, [autoFitConfigSignature, runAutoFitComputation, settings.autoFitOnePage]);

  useEffect(() => {
    if (previousResumeRef.current === resume) return;

    previousResumeRef.current = resume;

    if (!settings.autoFitOnePage) return;

    cancelPendingAutoFit();
    setFitStatus("stale");
  }, [cancelPendingAutoFit, resume, settings.autoFitOnePage]);

  useEffect(
    () => () => {
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      effectiveLayout,
      fitStatus,
      isComputing,
      recomputeAutoFit,
      getLayoutForExport,
    }),
    [
      effectiveLayout,
      fitStatus,
      getLayoutForExport,
      isComputing,
      recomputeAutoFit,
    ]
  );

  return (
    <AutoFitContext.Provider value={value}>{children}</AutoFitContext.Provider>
  );
};
