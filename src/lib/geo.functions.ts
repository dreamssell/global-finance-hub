import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { DEFAULT_LOCALE, localeFromAcceptLanguage, localeFromCountry, type Locale } from "@/i18n/config";

/**
 * Detects visitor locale from Cloudflare/Workers geo headers, falling back to
 * Accept-Language. Runs during SSR so the first render is already localized.
 */
export const detectVisitorLocale = createServerFn({ method: "GET" }).handler(async (): Promise<{
  locale: Locale;
  country: string | null;
}> => {
  const req = getRequest();
  const headers = req?.headers;
  if (!headers) return { locale: DEFAULT_LOCALE, country: null };

  const country =
    headers.get("cf-ipcountry") ??
    headers.get("x-vercel-ip-country") ??
    headers.get("x-country-code") ??
    null;

  const byCountry = country ? localeFromCountry(country) : null;
  const byAccept = localeFromAcceptLanguage(headers.get("accept-language"));
  return { locale: byCountry ?? byAccept ?? DEFAULT_LOCALE, country };
});
