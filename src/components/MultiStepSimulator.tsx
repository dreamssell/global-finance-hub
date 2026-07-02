import { useState } from "react";
import { useI18n } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "@/lib/leads.functions";
import { z } from "zod";
import { Car, Home, ShieldCheck, PiggyBank, CheckCircle2 } from "lucide-react";

type Product = "insurance" | "consortium";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  whatsapp: z.string().trim().max(40).optional(),
});

export function MultiStepSimulator({ country }: { country: string | null }) {
  const { t, locale } = useI18n();
  const submit = useServerFn(submitLead);
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [value, setValue] = useState<number[]>([50000]);
  const [contact, setContact] = useState({ name: "", email: "", whatsapp: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const total = 3;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    const parsed = contactSchema.safeParse(contact);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t.simulator.error);
      return;
    }
    setBusy(true);
    try {
      await submit({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          whatsapp: parsed.data.whatsapp || null,
          product,
          value_range: value[0]!,
          locale,
          country,
        },
      });
      setDone(true);
      toast.success(t.simulator.success);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.simulator.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="simulator" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16">
      <Card className="border-border/60 p-6 shadow-lg md:p-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{t.simulator.title}</h2>
          {!done && (
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {t.simulator.step} {step} {t.simulator.of} {total}
            </span>
          )}
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <CheckCircle2 className="h-14 w-14 text-primary" />
            <p className="text-lg font-medium">{t.simulator.success}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-3">
                <Label>{t.simulator.productLabel}</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ProductCard
                    icon={<ShieldCheck className="h-5 w-5" />}
                    label={t.simulator.insurance}
                    selected={product === "insurance"}
                    onClick={() => setProduct("insurance")}
                  />
                  <ProductCard
                    icon={<PiggyBank className="h-5 w-5" />}
                    label={t.simulator.consortium}
                    selected={product === "consortium"}
                    onClick={() => setProduct("consortium")}
                  />
                </div>
                <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Car className="h-3.5 w-3.5" /> Auto</span>
                  <span className="inline-flex items-center gap-1"><Home className="h-3.5 w-3.5" /> Home</span>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Label>{t.simulator.valueLabel}</Label>
                <Slider min={5000} max={500000} step={5000} value={value} onValueChange={setValue} />
                <div className="text-3xl font-bold">
                  {new Intl.NumberFormat(locale === "br" ? "pt-BR" : locale === "pt" ? "pt-PT" : locale, {
                    style: "currency",
                    currency: locale === "br" ? "BRL" : locale === "pt" || locale === "it" || locale === "es" ? "EUR" : "USD",
                    maximumFractionDigits: 0,
                  }).format(value[0]!)}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">{t.simulator.nameLabel}</Label>
                  <Input id="name" required maxLength={120} value={contact.name}
                    onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">{t.simulator.emailLabel}</Label>
                  <Input id="email" type="email" required maxLength={255} value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="wa">{t.simulator.whatsappLabel}</Label>
                  <Input id="wa" inputMode="tel" maxLength={40} value={contact.whatsapp}
                    onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="ghost" disabled={step === 1 || busy}
                onClick={() => setStep((s) => Math.max(1, s - 1))}>{t.simulator.back}</Button>
              {step < total ? (
                <Button type="button" disabled={step === 1 && !product}
                  onClick={() => setStep((s) => Math.min(total, s + 1))}>{t.simulator.next}</Button>
              ) : (
                <Button type="submit" disabled={busy}>{t.simulator.submit}</Button>
              )}
            </div>
          </form>
        )}
      </Card>
    </section>
  );
}

function ProductCard({
  icon, label, selected, onClick,
}: { icon: React.ReactNode; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      className={`group flex items-start gap-3 rounded-xl border p-4 text-left transition ${
        selected ? "border-primary bg-primary/5 ring-2 ring-primary/40" : "border-border hover:border-primary/50"
      }`}
    >
      <span className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</span>
      <span className="text-sm font-medium leading-tight">{label}</span>
    </button>
  );
}
