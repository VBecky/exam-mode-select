CREATE TABLE public.notifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, body text NOT NULL DEFAULT '', icon text NOT NULL DEFAULT '🔔', published boolean NOT NULL DEFAULT true, published_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.notifications TO anon, authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published notifications are readable" ON public.notifications FOR SELECT TO anon, authenticated USING (published AND published_at <= now());
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.notifications (title, body, icon) VALUES ('Welcome to EthioExam', 'Practice real Ethiopian Grade 12 national exam papers. New papers will be announced here.', '🎉');