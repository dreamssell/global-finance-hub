
ALTER TABLE public.financial_performance ADD COLUMN IF NOT EXISTS locale TEXT;
CREATE INDEX IF NOT EXISTS idx_finance_post_slug ON public.financial_performance (post_slug);
CREATE INDEX IF NOT EXISTS idx_finance_locale ON public.financial_performance (locale);

CREATE TABLE IF NOT EXISTS public.mcp_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES public.mcp_servers(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB,
  signature TEXT,
  status_code INT,
  verified BOOLEAN NOT NULL DEFAULT false,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mcp_webhook_logs TO authenticated;
GRANT ALL ON public.mcp_webhook_logs TO service_role;
ALTER TABLE public.mcp_webhook_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage mcp logs" ON public.mcp_webhook_logs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS idx_mcp_logs_created ON public.mcp_webhook_logs (created_at DESC);
