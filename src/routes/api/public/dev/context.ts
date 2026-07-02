import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Public read-only developer/AI context endpoint.
// Exposes: published posts (multilingual columns) and anonymous aggregates.
// No user PII. No lead emails. No admin data.
export const Route = createFileRoute("/api/public/dev/context")({
  server: {
    handlers: {
      GET: async () => {
        const sb = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const [{ data: posts }, { data: events }] = await Promise.all([
          sb.from("posts").select("id,slug,tags,cover_image,title_br,title_pt,title_en,title_es,title_it,excerpt_br,excerpt_pt,excerpt_en,excerpt_es,excerpt_it,missing_locales,updated_at").eq("published", true),
          sb.from("analytics_events").select("event_type,country,locale,created_at").limit(1000),
        ]);
        const byCountry: Record<string, number> = {};
        const byLocale: Record<string, number> = {};
        for (const e of events ?? []) {
          if (e.country) byCountry[e.country] = (byCountry[e.country] ?? 0) + 1;
          if (e.locale) byLocale[e.locale] = (byLocale[e.locale] ?? 0) + 1;
        }
        return Response.json({
          version: "v1",
          generated_at: new Date().toISOString(),
          posts: posts ?? [],
          traffic: { total: (events ?? []).length, byCountry, byLocale },
        }, { headers: { "Cache-Control": "public, max-age=60" } });
      },
    },
  },
});
