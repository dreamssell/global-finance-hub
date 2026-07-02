import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getAnalyticsSummary } from "@/lib/analytics.functions";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";

const searchSchema = z.object({
  path: fallback(z.string(), "__all__").default("__all__"),
  halfLife: fallback(z.number().int().min(0).max(168), 24).default(24),
  cbSafe: fallback(z.boolean(), false).default(false),
  showOverlay: fallback(z.boolean(), true).default(true),
});

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  validateSearch: zodValidator(searchSchema),
  component: Analytics,
});

// Default palette (blue → red) and color-blind safe palette (viridis-ish: blue → yellow)
const PALETTE = {
  normal: {
    heatmapHue: (w: number) => Math.round(220 - 220 * w), // blue → red
    scrollBuckets: [
      "hsla(220,80%,55%,0.35)",
      "hsla(160,80%,50%,0.55)",
      "hsla(40,90%,55%,0.75)",
      "hsla(0,85%,55%,0.9)",
    ],
    scrollLegend: [
      "hsla(220,80%,55%,0.6)",
      "hsla(160,80%,50%,0.7)",
      "hsla(40,90%,55%,0.85)",
      "hsla(0,85%,55%,0.95)",
    ],
    gradient:
      "linear-gradient(to right, hsla(220,90%,50%,0.25), hsla(160,90%,50%,0.45), hsla(60,95%,55%,0.65), hsla(20,95%,55%,0.8), hsla(0,90%,50%,0.9))",
  },
  cbSafe: {
    // Blue → teal → yellow (viridis-inspired, safe for deuteranopia/protanopia)
    heatmapHue: (w: number) => Math.round(260 - 200 * w),
    scrollBuckets: [
      "hsla(260,60%,40%,0.45)",
      "hsla(200,70%,45%,0.6)",
      "hsla(160,60%,45%,0.75)",
      "hsla(55,90%,55%,0.9)",
    ],
    scrollLegend: [
      "hsla(260,60%,40%,0.7)",
      "hsla(200,70%,45%,0.8)",
      "hsla(160,60%,45%,0.85)",
      "hsla(55,90%,55%,0.95)",
    ],
    gradient:
      "linear-gradient(to right, hsla(260,60%,40%,0.5), hsla(220,70%,45%,0.65), hsla(180,65%,45%,0.75), hsla(120,60%,50%,0.85), hsla(55,90%,55%,0.95))",
  },
};

function Analytics() {
  const fn = useServerFn(getAnalyticsSummary);
  const q = useQuery({ queryKey: ["analytics-summary"], queryFn: () => fn() });
  const data = q.data;

  const { path: selectedPath, halfLife, cbSafe, showOverlay } = Route.useSearch();
  const navigate = Route.useNavigate();
  const setSearch = (patch: Partial<z.infer<typeof searchSchema>>) =>
    navigate({
      search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, ...patch }),
      replace: true,
    });

  const palette = cbSafe ? PALETTE.cbSafe : PALETTE.normal;

  const paths = useMemo(() => {
    const set = new Set<string>();
    (data?.heatmap ?? []).forEach((p) => set.add(p.path));
    (data?.scrollByPath ?? []).forEach((s) => set.add(s.path));
    return Array.from(set).sort();
  }, [data]);

  const points = useMemo(() => {
    const src = (data?.heatmap ?? []).filter(
      (p) => selectedPath === "__all__" || p.path === selectedPath,
    );
    return src.map((p) => {
      const weight = halfLife > 0 ? Math.pow(0.5, p.ageHours / halfLife) : 1;
      return { ...p, weight };
    });
  }, [data, selectedPath, halfLife]);

  const scrollRow = useMemo(() => {
    const list = data?.scrollByPath ?? [];
    if (selectedPath === "__all__") {
      const agg = [0, 0, 0, 0];
      let count = 0;
      let avgSum = 0;
      for (const s of list) {
        s.buckets.forEach((v, i) => (agg[i] += v));
        count += s.count;
        avgSum += s.avg * s.count;
      }
      return { path: "All routes", buckets: agg, count, avg: count ? Math.round(avgSum / count) : 0 };
    }
    return list.find((s) => s.path === selectedPath) ?? { path: selectedPath, buckets: [0, 0, 0, 0], count: 0, avg: 0 };
  }, [data, selectedPath]);

  const bucketLabels = ["0–24%", "25–49%", "50–74%", "75–100%"];
  const bucketDescriptions = [
    "Cold — few visitors reached this depth",
    "Warm — moderate reach",
    "Hot — most visitors scrolled here",
    "Peak — visitors reached the bottom",
  ];
  const bucketTotal = scrollRow.buckets.reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Analytics</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Configurable click decay and per-route scroll intensity across the last 30 days.
      </p>
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
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Click heatmap overlay
            </h2>
            <p className="text-xs text-muted-foreground">
              {points.length} clicks · route {selectedPath === "__all__" ? "all" : selectedPath}
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:flex-wrap">
            <div className="w-56">
              <Label className="text-xs">Route</Label>
              <Select value={selectedPath} onValueChange={(v) => setSearch({ path: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All routes</SelectItem>
                  {paths.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-64">
              <Label className="text-xs">
                Decay half-life: {halfLife === 0 ? "off" : `${halfLife}h`}
              </Label>
              <Slider
                value={[halfLife]}
                min={0}
                max={168}
                step={1}
                onValueChange={(v) => setSearch({ halfLife: v[0] ?? 0 })}
                aria-label="Decay half-life in hours"
              />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Switch
                id="overlay-toggle"
                checked={showOverlay}
                onCheckedChange={(v) => setSearch({ showOverlay: v })}
                aria-label="Toggle heatmap overlay"
              />
              <Label htmlFor="overlay-toggle" className="text-xs">Overlay</Label>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Switch
                id="cbsafe-toggle"
                checked={cbSafe}
                onCheckedChange={(v) => setSearch({ cbSafe: v })}
                aria-label="Toggle color-blind safe palette"
              />
              <Label htmlFor="cbsafe-toggle" className="text-xs">Color-blind safe</Label>
            </div>
          </div>
        </div>

        <div
          role="img"
          aria-label={`Heatmap overlay showing ${points.length} click points${cbSafe ? ", color-blind safe palette" : ""}`}
          className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-muted/30"
        >
          {showOverlay && points.map((p, i) => {
            const w = p.weight;
            const hue = palette.heatmapHue(w);
            const alpha = 0.15 + 0.55 * w;
            const size = 14 + 18 * w;
            return (
              <span
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-multiply"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: size,
                  height: size,
                  background: `hsla(${hue}, 90%, 50%, ${alpha})`,
                  boxShadow: `0 0 ${size}px hsla(${hue}, 90%, 50%, ${alpha * 0.6})`,
                }}
              />
            );
          })}
          {!showOverlay && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              Overlay hidden
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground" aria-label="Intensity legend">
          <span className="font-medium text-foreground">Click recency</span>
          <div
            role="img"
            aria-label={`Gradient: cold or older on the left, hot or recent on the right${cbSafe ? " (color-blind safe)" : ""}`}
            className="h-3 flex-1 min-w-[160px] rounded-full"
            style={{ background: palette.gradient }}
          />
          <span aria-hidden="true">◐ cold (old)</span>
          <span aria-hidden="true">→</span>
          <span aria-hidden="true">● hot (recent)</span>
        </div>
      </Card>

      <Card className="mt-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Scroll intensity — {scrollRow.path}
          </h2>
          <span className="text-xs text-muted-foreground">
            {scrollRow.count} events · avg depth {scrollRow.avg}%
          </span>
        </div>
        <div
          role="img"
          aria-label={`Scroll depth distribution across four buckets: ${bucketLabels
            .map((l, i) => `${l} has ${scrollRow.buckets[i]} events`)
            .join(", ")}`}
          className="flex h-8 w-full overflow-hidden rounded-md border border-border/60"
        >
          {scrollRow.buckets.map((v, i) => {
            const pct = (v / bucketTotal) * 100;
            return (
              <div
                key={i}
                className="flex items-center justify-center text-[10px] font-medium text-foreground/80"
                style={{ width: `${pct}%`, background: palette.scrollBuckets[i] }}
                title={`${bucketLabels[i]} — ${bucketDescriptions[i]} · ${v} events (${Math.round(pct)}%)`}
                aria-label={`${bucketLabels[i]}: ${bucketDescriptions[i]}, ${v} events (${Math.round(pct)}%)`}
              >
                {pct > 8 ? `${Math.round(pct)}%` : ""}
              </div>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground md:grid-cols-4" role="list">
          {bucketLabels.map((l, i) => (
            <div key={l} role="listitem" className="flex items-start gap-1.5">
              <span
                aria-hidden="true"
                className="mt-1 inline-block h-2 w-2 rounded-sm"
                style={{ background: palette.scrollLegend[i] }}
              />
              <span>
                <span className="font-medium text-foreground">{l}</span>
                <span className="block">{bucketDescriptions[i]} · {scrollRow.buckets[i]}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
