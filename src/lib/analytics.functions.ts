import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";

const eventSchema = z.object({
  event_type: z.string().min(1).max(64),
  path: z.string().max(512).optional().nullable(),
  post_slug: z.string().max(200).optional().nullable(),
  country: z.string().max(4).optional().nullable(),
  locale: z.string().max(5).optional().nullable(),
  x_pct: z.number().min(0).max(100).optional().nullable(),
  y_pct: z.number().min(0).max(100).optional().nullable(),
  scroll_depth: z.number().min(0).max(100).optional().nullable(),
  session_id: z.string().max(64).optional().nullable(),
});

export const logAnalyticsEvent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => eventSchema.parse(d))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await supabase.from("analytics_events").insert(data);
    return { ok: true };
  });

export const getAnalyticsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { data: events, error } = await context.supabase
      .from("analytics_events").select("*").gte("created_at", since).limit(5000);
    if (error) throw new Error(error.message);
    const rows = events ?? [];
    const byDay = new Map<string, number>();
    const byCountry = new Map<string, number>();
    const byLocale = new Map<string, number>();
    let clicks = 0;
    for (const e of rows) {
      const day = (e.created_at ?? "").slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
      if (e.country) byCountry.set(e.country, (byCountry.get(e.country) ?? 0) + 1);
      if (e.locale) byLocale.set(e.locale, (byLocale.get(e.locale) ?? 0) + 1);
      if (e.event_type === "click") clicks++;
    }
    return {
      total: rows.length,
      clicks,
      byDay: Array.from(byDay, ([day, count]) => ({ day, count })).sort((a, b) => a.day.localeCompare(b.day)),
      byCountry: Array.from(byCountry, ([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count),
      byLocale: Array.from(byLocale, ([locale, count]) => ({ locale, count })).sort((a, b) => b.count - a.count),
      heatmap: rows
        .filter((e) => e.event_type === "click" && e.x_pct != null && e.y_pct != null)
        .slice(0, 2000)
        .map((e) => ({
          x: Number(e.x_pct),
          y: Number(e.y_pct),
          path: e.path ?? "/",
          ageHours: e.created_at
            ? Math.max(0, (Date.now() - new Date(e.created_at).getTime()) / 3600000)
            : 0,
        })),
      scrollByPath: (() => {
        const map = new Map<string, { path: string; buckets: number[]; count: number; avg: number }>();
        for (const e of rows) {
          if (e.event_type !== "scroll" || e.scroll_depth == null) continue;
          const p = e.path ?? "/";
          const entry = map.get(p) ?? { path: p, buckets: [0, 0, 0, 0], count: 0, avg: 0 };
          const d = Number(e.scroll_depth);
          const idx = d >= 100 ? 3 : d >= 75 ? 3 : d >= 50 ? 2 : d >= 25 ? 1 : 0;
          entry.buckets[idx]++;
          entry.count++;
          entry.avg += d;
          map.set(p, entry);
        }
        return Array.from(map.values())
          .map((e) => ({ ...e, avg: e.count ? Math.round(e.avg / e.count) : 0 }))
          .sort((a, b) => b.count - a.count);
      })(),
    };
  });
