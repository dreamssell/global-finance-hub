import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const filterSchema = z.object({
  from: z.string().optional().nullable(),
  to: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  post_slug: z.string().optional().nullable(),
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
    const { data: rows, error } = await q.order("day", { ascending: true }).limit(1000);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
