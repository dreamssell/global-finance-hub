import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, LineChart, Wallet, Plug, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: LineChart },
  { to: "/admin/financial", label: "Financial", icon: Wallet },
  { to: "/admin/mcp", label: "MCP & Dev API", icon: Plug },
] as const;

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border/60 bg-card/40 md:flex md:flex-col">
      <div className="border-b border-border/60 p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Admin</div>
        <div className="text-lg font-semibold">Executive</div>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {items.map((it) => {
          const active = pathname === it.to;
          return (
            <Link key={it.to} to={it.to} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
              active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted"
            }`}>
              <it.icon className="h-4 w-4" /> {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/60 p-3">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2"
          onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
