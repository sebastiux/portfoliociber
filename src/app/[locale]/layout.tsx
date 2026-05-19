import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfolio · Carlos Ortega — Mechatronics & Cyber-Physical Systems Engineer",
  description:
    "Threat research, detection engineering, and a live YARA scanner. Carlos Ortega, Mechatronics & Cyber-Physical Systems engineer.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider>
          <SiteHeader />
          <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
          <footer className="border-t border-[color:var(--border)] py-6 text-center text-xs text-[color:var(--muted)]">
            built with next.js · yara-x · railway · no analytics
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
