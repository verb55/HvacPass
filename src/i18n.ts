import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

const locales = ["pl", "en", "de", "ua"] as const;

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  return {
    // Ścieżka została zaktualizowana do nowej lokalizacji pliku
    messages: (await import(`./i18n/messages/${locale}.json`)).default,
  };
});