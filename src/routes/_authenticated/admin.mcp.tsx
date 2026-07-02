import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type McpServer = { id: string; name: string; url: string; enabled: boolean; webhook_secret: string | null };

export const Route = createFileRoute("/_authenticated/admin/mcp")({ component: McpPage });

function McpPage() {
  const [rows, setRows] = useState<McpServer[]>([]);
  const [form, setForm] = useState({ name: "", url: "", webhook_secret: "" });

  async function load() {
    const { data, error } = await supabase.from("mcp_servers").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows((data ?? []) as McpServer[]);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!form.name || !form.url) { toast.error("Name and URL required"); return; }
    const { error } = await supabase.from("mcp_servers").insert({
      name: form.name, url: form.url, webhook_secret: form.webhook_secret || null,
    });
    if (error) { toast.error(error.message); return; }
    setForm({ name: "", url: "", webhook_secret: "" });
    load();
  }
  async function toggle(r: McpServer) {
    await supabase.from("mcp_servers").update({ enabled: !r.enabled }).eq("id", r.id);
    load();
  }
  async function remove(id: string) {
    await supabase.from("mcp_servers").delete().eq("id", id);
    load();
  }

  const devApiUrl = typeof window !== "undefined" ? `${window.location.origin}/api/public/dev/context` : "/api/public/dev/context";

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">MCP & Developer API</h1>

      <Card className="mb-6 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Developer API Gateway</h2>
        <p className="mt-2 text-sm">External AI agents can fetch anonymous context from:</p>
        <code className="mt-2 block break-all rounded-lg bg-muted p-3 text-xs">{devApiUrl}</code>
        <p className="mt-2 text-xs text-muted-foreground">Returns published posts (multilingual) and anonymized lead/analytics counters in JSON.</p>
      </Card>

      <Card className="mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Add MCP server</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>URL</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://mcp.example.com" /></div>
          <div><Label>Webhook secret</Label><Input value={form.webhook_secret} onChange={(e) => setForm({ ...form, webhook_secret: e.target.value })} /></div>
        </div>
        <div className="mt-3"><Button onClick={add}>Add</Button></div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">URL</th><th className="p-3">Enabled</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border/60">
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3 text-muted-foreground break-all">{r.url}</td>
                <td className="p-3"><Switch checked={r.enabled} onCheckedChange={() => toggle(r)} /></td>
                <td className="p-3 text-right"><Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">No servers configured.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
