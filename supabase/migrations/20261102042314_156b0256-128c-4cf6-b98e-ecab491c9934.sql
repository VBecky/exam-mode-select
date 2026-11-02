CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 name text NOT NULL DEFAULT '',
 phone text NOT NULL DEFAULT '',
 stream text NOT NULL DEFAULT 'natural',
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT profile_name_length CHECK (char_length(name) <= 100),
 CONSTRAINT profile_phone_length CHECK (char_length(phone) <= 16),
 CONSTRAINT profile_stream_valid CHECK (stream IN ('natural','social'))
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.create_account_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles(id,name,phone,stream) VALUES (NEW.id,left(coalesce(NEW.raw_user_meta_data->>'name',''),100),coalesce(NEW.phone,''),'natural') ON CONFLICT (id) DO NOTHING;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.create_account_profile() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER create_account_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_account_profile();
INSERT INTO public.profiles(id,name,phone) SELECT id,left(coalesce(raw_user_meta_data->>'name',''),100),coalesce(phone,'') FROM auth.users ON CONFLICT (id) DO NOTHING;