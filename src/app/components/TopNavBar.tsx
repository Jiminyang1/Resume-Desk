"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  useAppPreferences,
  useTranslation,
} from "components/AppPreferencesProvider";
import { cx } from "lib/cx";

export const TopNavBar = () => {
  const pathName = usePathname();
  const { uiLanguage, setUiLanguage } = useAppPreferences();
  const copy = useTranslation();
  const navItems = [
    { href: "/", label: copy.nav.dashboard, disabled: false },
    { href: "/resume-builder", label: copy.nav.builder, disabled: false },
    { href: "/resume-parser", label: copy.nav.parser, disabled: true },
  ];

  return (
    <header
      aria-label={copy.nav.headerAria}
      className="sticky top-0 z-40 border-b border-slate-300 bg-stone-50 px-4 lg:px-8"
    >
      <div className="mx-auto flex h-[var(--top-nav-bar-height)] w-full max-w-7xl items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900 lg:text-base">
              {copy.appName}
            </div>
            <div className="hidden text-xs text-slate-500 sm:block">
              {copy.nav.subtitle}
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <div
            className="hidden items-center border border-slate-300 bg-white text-sm font-medium md:flex"
            role="group"
            aria-label={copy.nav.languageSelectorAria}
          >
            <button
              type="button"
              className={cx(
                "border-r border-slate-300 px-3 py-2 text-sm transition",
                uiLanguage === "en"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
              aria-label={copy.nav.switchToEnglish}
              onClick={() => setUiLanguage("en")}
            >
              {copy.nav.english}
            </button>
            <button
              type="button"
              className={cx(
                "px-3 py-2 text-sm transition",
                uiLanguage === "zh-CN"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
              aria-label={copy.nav.switchToChinese}
              onClick={() => setUiLanguage("zh-CN")}
            >
              {copy.nav.chinese}
            </button>
          </div>
          <nav
            aria-label={copy.nav.primaryNavAria}
            className="flex items-center border border-slate-300 bg-white text-sm font-medium"
          >
            {navItems.map(({ href, label, disabled }) =>
              disabled ? (
                <span
                  key={label}
                  className="border-l border-slate-300 px-3 py-2 text-sm text-slate-400 first:border-l-0 lg:px-4"
                  aria-disabled="true"
                >
                  {label}
                </span>
              ) : (
                <Link
                  key={label}
                  className={cx(
                    "border-l border-slate-300 px-3 py-2 text-sm transition first:border-l-0 lg:px-4",
                    pathName === href
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100"
                  )}
                  href={href}
                >
                  {label}
                </Link>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

const LogoMark = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 33 33"
    className="h-9 w-9 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <g clipPath="url(#resume-desk-logo-clip)">
      <path
        d="M5.52936 9.25414V3.4703C5.52936 2.85672 5.7731 2.26826 6.20698 1.83439C6.64085 1.40052 7.22931 1.15677 7.84289 1.15677H19.4106L30.9782 12.7244V28.9192C30.9782 29.5328 30.7345 30.1212 30.3006 30.5551C29.8668 30.989 29.2783 31.2327 28.6647 31.2327H20.5673"
        stroke="currentColor"
        strokeWidth="2.31353"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4106 1.15677V12.7244H30.9783"
        stroke="currentColor"
        strokeWidth="2.31353"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.42126 15.038V18.5083"
        stroke="currentColor"
        strokeWidth="2.31353"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.41119 19.0867L4.41879 20.8218"
        stroke="currentColor"
        strokeWidth="2.31353"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.41119 27.184L4.41879 25.4489"
        stroke="currentColor"
        strokeWidth="2.31353"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.42126 31.2327V27.7624"
        stroke="currentColor"
        strokeWidth="2.31353"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.4312 27.184L12.4236 25.4489"
        stroke="currentColor"
        strokeWidth="2.31353"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.4312 19.0867L12.4236 20.8218"
        stroke="currentColor"
        strokeWidth="2.31353"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.42126 27.7624C10.9767 27.7624 13.0483 25.6908 13.0483 23.1353C13.0483 20.5799 10.9767 18.5083 8.42126 18.5083C5.8658 18.5083 3.79419 20.5799 3.79419 23.1353C3.79419 25.6908 5.8658 27.7624 8.42126 27.7624Z"
        stroke="currentColor"
        strokeWidth="2.31353"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="resume-desk-logo-clip">
        <rect width="32.3895" height="32.3895" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
