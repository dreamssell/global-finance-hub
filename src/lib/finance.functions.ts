import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const filterSchema = z.object({
  from: z.string().optional().nullable(),
  to: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  post_slug: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
}).default({});

export const getFinancialPerformance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => filterSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("financial_performance").select("*");
    if (data.from) q = q.gte("day", data.from);
    if (data.to) q = q.lte("day", data.to);
    if (data.country) q = q.eq("country", data.country);
    if (data.post_slug) q = q.eq("post_slug", data.post_slug);
    if (data.locale) q = q.eq("locale", data.locale);
    const { data: rows, error } = await q.order("day", { ascending: true }).limit(1000);
    if (error) throw new Error(error.message);
    const list = rows ?? [];

    // Per-post attribution: totals for insurance vs consortium grouped by (post_slug, locale)
    type Key = string;
    const attribution = new Map<Key, {
      post_slug: string;
      locale: string;
      insurance_revenue: number;
      consortium_revenue: number;
      insurance_units: number;
      consortium_units: number;
      total_revenue: number;
    }>();
    for (const r of list) {
      const key = `${r.post_slug ?? "(none)"}::${r.locale ?? "(none)"}`;
      const entry = attribution.get(key) ?? {
        post_slug: r.post_slug ?? "(none)",
        locale: r.locale ?? "(none)",
        insurance_revenue: 0,
        consortium_revenue: 0,
        insurance_units: 0,
        consortium_units: 0,
        total_revenue: 0,
      };
      const rev = Number(r.revenue);
      const units = Number(r.units);
      if (r.product === "insurance") {
        entry.insurance_revenue += rev;
        entry.insurance_units += units;
      } else {
        entry.consortium_revenue += rev;
        entry.consortium_units += units;
      }
      entry.total_revenue += rev;
      attribution.set(key, entry);
    }
    const breakdown = Array.from(attribution.values()).sort(
      (a, b) => b.total_revenue - a.total_revenue,
    );
    return { rows: list, breakdown };
  });
