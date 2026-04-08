import "globals.css";
import { AppPreferencesProvider } from "components/AppPreferencesProvider";
import { TopNavBar } from "components/TopNavBar";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Resume Desk - Free Resume Builder",
  description:
    "Resume Desk is a free, local-first resume builder for writing, saving, and exporting polished resumes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-slate-900">
        <AppPreferencesProvider>
          <TopNavBar />
          {children}
          <Analytics />
        </AppPreferencesProvider>
      </body>
    </html>
  );
}
