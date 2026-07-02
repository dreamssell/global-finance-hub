// Central i18n config: supported locales, flags, ISO abbreviations, and country map.
export const LOCALES = ["br", "pt", "en", "es", "it"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_META: Record<Locale, { flag: string; label: string; iso: string; lang: string }> = {
  br: { flag: "🇧🇷", label: "Português (BR)", iso: "BR", lang: "pt-BR" },
  pt: { flag: "🇵🇹", label: "Português (PT)", iso: "PT", lang: "pt-PT" },
  en: { flag: "🇺🇸", label: "English",         iso: "EN", lang: "en" },
  es: { flag: "🇪🇸", label: "Español",         iso: "ES", lang: "es" },
  it: { flag: "🇮🇹", label: "Italiano",        iso: "IT", lang: "it" },
};

// CPLP (excluding BR) → PT
const CPLP_NON_BR = new Set([
  "PT","AO","MZ","CV","GW","ST","TL","GQ","MO",
]);
const LATAM_ES = new Set([
  "AR","BO","CL","CO","CR","CU","DO","EC","SV","GT","HN","MX","NI","PA","PY","PE","PR","UY","VE",
]);

export function localeFromCountry(country: string | null | undefined): Locale {
  if (!country) return DEFAULT_LOCALE;
  const c = country.toUpperCase();
  if (c === "BR") return "br";
  if (CPLP_NON_BR.has(c)) return "pt";
  if (c === "IT") return "it";
  if (c === "ES" || LATAM_ES.has(c)) return "es";
  return "en";
}

export function localeFromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const first = header.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("pt-br")) return "br";
  if (first.startsWith("pt")) return "pt";
  if (first.startsWith("it")) return "it";
  if (first.startsWith("es")) return "es";
  if (first.startsWith("en")) return "en";
  return null;
}

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}
