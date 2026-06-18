import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import "@/app/globals.css";
import { CookieConsent } from "@/components/layout/cookie-consent";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://linkify-jobs.de";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Linkify Jobs — Finde deinen Traumjob mit KI",
    template: "%s | Linkify Jobs",
  },
  description: "KI-gestützter Job-Aggregator für Deutschland. Finde passende Stellen, bewirb dich automatisch und erhalte personalisierte Anschreiben.",
  keywords: ["Jobs", "Stellenangebote", "Jobsuche", "KI", "AI", "Bewerbung", "Deutschland", "Karriere"],
  authors: [{ name: "Linkify Jobs" }],
  openGraph: {
    type: "website",
    locale: "de_DE",
    alternateLocale: "en_US",
    siteName: "Linkify Jobs",
    title: "Linkify Jobs — Finde deinen Traumjob mit KI",
    description: "KI-gestützter Job-Aggregator für Deutschland. Finde passende Stellen, bewirb dich automatisch.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Linkify Jobs — Finde deinen Traumjob mit KI",
    description: "KI-gestützter Job-Aggregator für Deutschland.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const inter = Inter({ subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
