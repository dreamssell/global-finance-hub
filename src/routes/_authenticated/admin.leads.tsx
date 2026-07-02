import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listLeads, updateLeadStatus } from "@/lib/leads.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/leads")({ component: Leads });

function Leads() {
  const qc = useQueryClient();
  const listFn = useServerFn(listLeads);
  const updateFn = useServerFn(updateLeadStatus);
  const q = useQuery({ queryKey: ["leads"], queryFn: () => listFn() });
  const mut = useMutation({
    mutationFn: (v: { id: string; status: "new" | "contacted" | "sold" | "archived" }) => updateFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const rows = q.data ?? [];

  function exportCsv() {
    const header = ["id","name","email","whatsapp","product","value_range","locale","country","status","created_at"];
    const csv = [header.join(","), ...rows.map((r) => header.map((k) => JSON.stringify((r as Record<string, unknown>)[k] ?? "")).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "leads.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Product</th>
                <th className="p-3">Value</th><th className="p-3">Origin</th><th className="p-3">Status</th>
                <th className="p-3">Contact</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-t border-border/60">
                  <td className="p-3 font-medium">{l.name}</td>
                  <td className="p-3 text-muted-foreground">{l.email}</td>
                  <td className="p-3"><Badge variant="secondary">{l.product}</Badge></td>
                  <td className="p-3 font-mono">{Number(l.value_range).toLocaleString()}</td>
                  <td className="p-3">
                    <Badge variant="outline">{(l.country ?? "?")}·{l.locale}</Badge>
                  </td>
                  <td className="p-3">
                    <Select value={l.status} onValueChange={(v) => mut.mutate({ id: l.id, status: v as "new" | "contacted" | "sold" | "archived" })}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    {l.whatsapp && (
                      <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No leads yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
