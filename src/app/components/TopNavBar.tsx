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
    viewBox="0 0 48 48"
    className="h-9 w-9 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <rect x="5" y="5" width="38" height="38" stroke="#111827" strokeWidth="2.5" />
    <path
      d="M17 11.5H30L35 16.5V31H17V11.5Z"
      fill="#FAFAF9"
      stroke="#111827"
      strokeWidth="2.5"
      strokeLinejoin="miter"
    />
    <path
      d="M30 11.5V16.5H35"
      stroke="#111827"
      strokeWidth="2.5"
      strokeLinejoin="miter"
    />
    <path d="M14 35H38" stroke="#6B7280" strokeWidth="2.5" />
    <path d="M19.5 39H32.5" stroke="#111827" strokeWidth="2.5" />
  </svg>
);
