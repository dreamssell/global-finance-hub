import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function hmacSha256Hex(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const dispatchMcpWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      server_id: z.string().uuid(),
      event: z.string().min(1).max(64).default("test.ping"),
      payload: z.record(z.string(), z.unknown()).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: server, error } = await context.supabase
      .from("mcp_servers").select("*").eq("id", data.server_id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!server) throw new Error("Server not found");

    const body = JSON.stringify({
      event: data.event,
      timestamp: new Date().toISOString(),
      payload: data.payload ?? { hello: "world" },
    });
    const secret = server.webhook_secret ?? "";
    const signature = secret ? await hmacSha256Hex(secret, body) : "";

    let statusCode: number | null = null;
    let verified = false;
    let errMsg: string | null = null;
    try {
      const res = await fetch(server.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mcp-event": data.event,
          "x-mcp-signature": `sha256=${signature}`,
          "x-mcp-timestamp": new Date().toISOString(),
        },
        body,
      });
      statusCode = res.status;
      // Verification: server echoes signature back in `x-mcp-signature-ack` if it validated.
      const ack = res.headers.get("x-mcp-signature-ack");
      verified = !!secret && !!ack && ack.replace(/^sha256=/, "") === signature;
      if (!res.ok) errMsg = await res.text().catch(() => `HTTP ${res.status}`);
    } catch (e) {
      errMsg = e instanceof Error ? e.message : String(e);
    }

    await context.supabase.from("mcp_webhook_logs").insert({
      server_id: server.id,
      event: data.event,
      payload: JSON.parse(body),
      signature: signature ? `sha256=${signature}` : null,
      status_code: statusCode,
      verified,
      error: errMsg,
    });

    return { statusCode, verified, error: errMsg, signed: !!secret };
  });

export const getMcpWebhookLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mcp_webhook_logs")
      .select("id, server_id, event, status_code, verified, signature, error, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });