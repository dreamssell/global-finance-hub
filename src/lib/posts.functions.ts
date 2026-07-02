import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";
import { LOCALES, type Locale } from "@/i18n/config";

function publicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type LocalizedPost = {
  id: string;
  slug: string;
  cover_image: string | null;
  tags: string[];
  title: string;
  excerpt: string | null;
  body: string | null;
  localeUsed: Locale;
  missingLocales: string[];
};

function pickLocale<T extends Record<string, unknown>>(row: T, wanted: Locale): { used: Locale; title: string; excerpt: string | null; body: string | null } {
  const order: Locale[] = [wanted, "en", "br", "pt", "es", "it"];
  for (const l of order) {
    const title = row[`title_${l}` as keyof T] as string | null | undefined;
    if (title && title.trim()) {
      return {
        used: l,
        title,
        excerpt: (row[`excerpt_${l}` as keyof T] as string | null | undefined) ?? null,
        body: (row[`body_${l}` as keyof T] as string | null | undefined) ?? null,
      };
    }
  }
  return { used: wanted, title: row.slug as string, excerpt: null, body: null };
}

export const listPublishedPosts = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ locale: z.enum(LOCALES).default("en") }).parse(d))
  .handler(async ({ data }): Promise<LocalizedPost[]> => {
    const { data: rows, error } = await publicClient()
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => {
      const p = pickLocale(r, data.locale);
      return {
        id: r.id, slug: r.slug, cover_image: r.cover_image, tags: r.tags ?? [],
        title: p.title, excerpt: p.excerpt, body: p.body,
        localeUsed: p.used, missingLocales: r.missing_locales ?? [],
      };
    });
  });

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1), locale: z.enum(LOCALES).default("en") }).parse(d))
  .handler(async ({ data }): Promise<LocalizedPost | null> => {
    const { data: row, error } = await publicClient()
      .from("posts").select("*").eq("slug", data.slug).eq("published", true).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const p = pickLocale(row, data.locale);
    return {
      id: row.id, slug: row.slug, cover_image: row.cover_image, tags: row.tags ?? [],
      title: p.title, excerpt: p.excerpt, body: p.body,
      localeUsed: p.used, missingLocales: row.missing_locales ?? [],
    };
  });
