CREATE TABLE public.lead_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  lead_count INTEGER NOT NULL,
  leads JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own searches" ON public.lead_searches FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own searches" ON public.lead_searches FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own searches" ON public.lead_searches FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_lead_searches_user_created ON public.lead_searches(user_id, created_at DESC);