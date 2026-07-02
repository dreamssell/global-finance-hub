import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getFinancialPerformance } from "@/lib/finance.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/financial")({ component: Financial });

function Financial() {
  const fn = useServerFn(getFinancialPerformance);
  const [filters, setFilters] = useState({ from: "", to: "", country: "", post_slug: "" });
  const q = useQuery({
    queryKey: ["finance", filters],
    queryFn: () => fn({ data: { ...filters, from: filters.from || null, to: filters.to || null, country: filters.country || null, post_slug: filters.post_slug || null } }),
  });

  // Pivot rows to a per-day series with insurance vs consortium revenue.
  const byDay = new Map<string, { day: string; insurance: number; consortium: number }>();
  for (const r of q.data ?? []) {
    const key = String(r.day);
    if (!byDay.has(key)) byDay.set(key, { day: key, insurance: 0, consortium: 0 });
    const acc = byDay.get(key)!;
    if (r.product === "insurance") acc.insurance += Number(r.revenue);
    else acc.consortium += Number(r.revenue);
  }
  const series = Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day));

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Financial · Seguros vs Consórcios</h1>
      <Card className="mb-6 p-5">
        <div className="grid gap-3 md:grid-cols-5">
          <div><Label>From</Label><Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></div>
          <div><Label>To</Label><Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></div>
          <div><Label>Country</Label><Input placeholder="BR" value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })} /></div>
          <div><Label>Post slug</Label><Input placeholder="my-article" value={filters.post_slug} onChange={(e) => setFilters({ ...filters, post_slug: e.target.value })} /></div>
          <div className="flex items-end"><Button variant="outline" onClick={() => setFilters({ from: "", to: "", country: "", post_slug: "" })}>Reset</Button></div>
        </div>
      </Card>
      <Card className="p-5">
        <div className="h-80">
          <ResponsiveContainer>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="insurance" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="Insurance" />
              <Line type="monotone" dataKey="consortium" stroke="var(--chart-2)" strokeWidth={2} dot={false} name="Consortium" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="p-3">Day</th><th className="p-3">Product</th><th className="p-3">Country</th><th className="p-3">Post</th><th className="p-3">Units</th><th className="p-3">Revenue</th></tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((r) => (
              <tr key={r.id} className="border-t border-border/60">
                <td className="p-3">{String(r.day)}</td>
                <td className="p-3">{r.product}</td>
                <td className="p-3">{r.country ?? "—"}</td>
                <td className="p-3">{r.post_slug ?? "—"}</td>
                <td className="p-3 font-mono">{r.units}</td>
                <td className="p-3 font-mono">{Number(r.revenue).toLocaleString()} {r.currency}</td>
              </tr>
            ))}
            {(q.data ?? []).length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No rows.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
