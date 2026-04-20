-- Webhook logs table
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'cakto',
  event_type TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert webhook logs" ON public.webhook_logs
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_webhook_logs_created ON public.webhook_logs(created_at DESC);

-- Block users
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false;

-- Admin management policies
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any page" ON public.love_pages
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));