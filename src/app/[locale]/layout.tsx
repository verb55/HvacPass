import "@/app/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AppShell } from "@/components/layout";
import type { Locale } from "@/i18n/config";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const locale = params?.locale || "pl";
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full">
      <body className="h-full">
        <NextIntlClientProvider messages={messages}>
          <AppShell locale={locale as Locale}>{children}</AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
