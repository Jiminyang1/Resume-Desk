"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { AutoFitProvider } from "components/Resume/AutoFitProvider";
import { store } from "lib/redux/store";
import { ResumeForm } from "components/ResumeForm";
import { Resume } from "components/Resume";

export default function Create() {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <Provider store={store}>
      <AutoFitProvider>
        <main className="fixed inset-x-0 bottom-0 top-[var(--top-nav-bar-height)] overflow-hidden px-4 py-4 lg:px-8">
          <div className="mx-auto grid h-full max-w-[1460px] gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="min-h-0 overflow-hidden border border-slate-300 bg-white">
              <ResumeForm />
            </div>
            <div className="min-h-0 overflow-hidden border border-slate-300 bg-white">
              <Resume />
            </div>
          </div>
        </main>
      </AutoFitProvider>
    </Provider>
  );
}
