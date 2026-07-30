CREATE TABLE public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id integer NOT NULL,
  subject_name text NOT NULL,
  year text NOT NULL,
  position integer NOT NULL,
  text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  answer integer NOT NULL DEFAULT 0,
  explanation text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subject_id, year, position)
);

GRANT SELECT ON public.exam_questions TO anon;
GRANT SELECT ON public.exam_questions TO authenticated;
GRANT ALL ON public.exam_questions TO service_role;

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exam questions are publicly readable"
  ON public.exam_questions FOR SELECT
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_exam_questions_updated_at
BEFORE UPDATE ON public.exam_questions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_exam_questions_subject_year ON public.exam_questions (subject_id, year, position);