import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsSummary } from "@/lib/analytics.functions";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/analytics")({ component: Analytics });

function Analytics() {
  const fn = useServerFn(getAnalyticsSummary);
  const q = useQuery({ queryKey: ["analytics-summary"], queryFn: () => fn() });
  const data = q.data;
  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Analytics</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Events / day (30d)</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={data?.byDay ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--primary)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">By locale</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data?.byLocale ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="locale" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card className="mt-6 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Click heatmap (last 500)</h2>
        <div className="relative aspect-video w-full rounded-lg border border-border/60 bg-muted/30">
          {(data?.heatmap ?? []).map((p, i) => (
            <span key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40 mix-blend-multiply"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: 18, height: 18 }} />
          ))}
        </div>
      </Card>
    </div>
  );
}
