import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n/LanguageProvider";
import { LanguageSelector } from "./LanguageSelector";
import { ShieldCheck } from "lucide-react";

export function PublicHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>Seguros<span className="text-primary">&amp;</span>Consórcios</span>
        </Link>
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <Link to="/" className="hover:text-foreground">{t.nav.home}</Link>
          <Link to="/blog" className="hover:text-foreground">{t.nav.blog}</Link>
          <a href="#simulator" className="hover:text-foreground">{t.nav.simulator}</a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
