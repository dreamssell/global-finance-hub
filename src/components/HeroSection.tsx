import { useI18n } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Wallet } from "lucide-react";

export function HeroSection() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col justify-center gap-6">
          <span className="w-fit rounded-full border border-border/60 bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            {t.hero.eyebrow}
          </span>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
            {t.hero.title}
          </h1>
          <p className="max-w-xl text-pretty text-lg text-muted-foreground">{t.hero.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#simulator" className="gap-2">
                {t.hero.cta} <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2">
              <TrendingUp className="h-4 w-4 text-primary" /> {t.hero.compareFinance}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2">
              <Wallet className="h-4 w-4 text-primary" /> {t.hero.comparePlan}
            </div>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl glass-card p-6 animate-fade-in">
            {/* Gradient overlay to reinforce hierarchy */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-0 opacity-80"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.14 220 / 0.18) 0%, transparent 45%, oklch(0.70 0.16 300 / 0.15) 100%)",
              }}
            />
            <div className="relative mb-4 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
              <span>vs.</span><span>2026</span>
            </div>
            <div className="relative grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-primary/15 p-4 ring-1 ring-primary/20">
                <div className="text-sm text-muted-foreground">{t.hero.compareFinance}</div>
                <div className="mt-2 text-3xl font-bold text-foreground">62%</div>
                <div className="text-xs text-muted-foreground">protection</div>
              </div>
              <div className="rounded-2xl bg-accent/60 p-4 ring-1 ring-border/60">
                <div className="text-sm text-muted-foreground">{t.hero.comparePlan}</div>
                <div className="mt-2 text-3xl font-bold">38%</div>
                <div className="text-xs text-muted-foreground">savings</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
