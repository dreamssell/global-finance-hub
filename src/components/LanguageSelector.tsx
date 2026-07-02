import { useI18n } from "@/i18n/LanguageProvider";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/config";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const meta = LOCALE_META[locale];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" aria-label="Select language">
          <span className="text-lg leading-none" aria-hidden>{meta.flag}</span>
          <span className="font-semibold tracking-wide">{meta.iso}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((l: Locale) => (
          <DropdownMenuItem key={l} onClick={() => setLocale(l)} className="gap-2">
            <span className="text-lg" aria-hidden>{LOCALE_META[l].flag}</span>
            <span>{LOCALE_META[l].label}</span>
            <span className="ml-auto text-xs text-muted-foreground">{LOCALE_META[l].iso}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
