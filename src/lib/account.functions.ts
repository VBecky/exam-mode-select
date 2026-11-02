import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { profileSchema } from './account-validation';

export const getAccount = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: auth, error: authError } = await context.supabase.auth.getUser();
  if (authError || !auth.user) throw new Error('Please log in again.');
  const { data, error } = await context.supabase.from('profiles').select('id,name,phone,stream').eq('id', context.userId).single();
  if (error) throw new Error('Unable to load your account. Please try again.');
  return {...data,phone:auth.user.phone??data.phone};
});
export const saveAccount = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => profileSchema.parse(input)).handler(async ({ data, context }) => {
  const { data: auth, error: authError } = await context.supabase.auth.getUser();
  if (authError || !auth.user) throw new Error('Please log in again.');
  const { data: profile, error } = await context.supabase.from('profiles').update({...data,phone:auth.user.phone??''}).eq('id', context.userId).select('id,name,phone,stream').single();
  if (error) throw new Error('Unable to save your account. Please try again.');
  return profile;
});