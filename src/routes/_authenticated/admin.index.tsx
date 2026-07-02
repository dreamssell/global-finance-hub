import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isCurrentUserAdmin, claimInitialAdmin } from "@/lib/roles.functions";
import { getAnalyticsSummary } from "@/lib/analytics.functions";
import { listLeads } from "@/lib/leads.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MousePointerClick, Globe2, LineChart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const qc = useQueryClient();
  const isAdminFn = useServerFn(isCurrentUserAdmin);
  const claim = useServerFn(claimInitialAdmin);
  const analyticsFn = useServerFn(getAnalyticsSummary);
  const leadsFn = useServerFn(listLeads);

  const adminQ = useQuery({ queryKey: ["is-admin"], queryFn: () => isAdminFn() });
  const isAdmin = adminQ.data?.isAdmin === true;

  const analyticsQ = useQuery({
    queryKey: ["analytics-summary"], queryFn: () => analyticsFn(), enabled: isAdmin,
  });
  const leadsQ = useQuery({
    queryKey: ["leads"], queryFn: () => leadsFn(), enabled: isAdmin,
  });

  const claimMut = useMutation({
    mutationFn: () => claim(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["is-admin"] }),
  });

  if (adminQ.isLoading) return <div className="p-10 text-muted-foreground">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl p-10">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">You are signed in, but not an admin yet.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            If this is a fresh install, you can claim the initial admin role now. Once an admin exists, this button becomes inert.
          </p>
          <Button className="mt-4" disabled={claimMut.isPending} onClick={() => claimMut.mutate()}>
            {claimMut.isPending ? "Claiming…" : "Claim initial admin"}
          </Button>
          {claimMut.data?.claimed === false && (
            <p className="mt-3 text-sm text-destructive">An admin already exists — ask them to grant you the role.</p>
          )}
        </Card>
      </div>
    );
  }

  const total = analyticsQ.data?.total ?? 0;
  const clicks = analyticsQ.data?.clicks ?? 0;
  const countries = analyticsQ.data?.byCountry.length ?? 0;
  const leads = leadsQ.data?.length ?? 0;

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<LineChart className="h-5 w-5" />} label="Events (30d)" value={total} />
        <Stat icon={<MousePointerClick className="h-5 w-5" />} label="Clicks (30d)" value={clicks} />
        <Stat icon={<Globe2 className="h-5 w-5" />} label="Countries" value={countries} />
        <Stat icon={<Users className="h-5 w-5" />} label="Leads" value={leads} />
      </div>

      <Card className="mt-6 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Traffic by country</h2>
        <div className="space-y-2">
          {(analyticsQ.data?.byCountry ?? []).slice(0, 8).map((r) => (
            <div key={r.country} className="flex items-center justify-between text-sm">
              <span>{r.country}</span><span className="font-mono">{r.count}</span>
            </div>
          ))}
          {(!analyticsQ.data || analyticsQ.data.byCountry.length === 0) && (
            <p className="text-sm text-muted-foreground">No traffic yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-sm">{label}</span></div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </Card>
  );
}
