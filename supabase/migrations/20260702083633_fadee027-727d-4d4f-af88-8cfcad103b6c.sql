
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY "Anyone can submit lead" ON public.leads;
CREATE POLICY "Anyone can submit lead" ON public.leads FOR INSERT TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 120
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(email) <= 255
  AND value_range >= 0 AND value_range < 100000000
);

DROP POLICY "Anyone can log analytics" ON public.analytics_events;
CREATE POLICY "Anyone can log analytics" ON public.analytics_events FOR INSERT TO anon, authenticated
WITH CHECK (
  length(event_type) BETWEEN 1 AND 64
  AND (path IS NULL OR length(path) <= 512)
);
