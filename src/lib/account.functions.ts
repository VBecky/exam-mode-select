import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { accountSchema, deleteAccountSchema } from './account-validation';

export const getAccount = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: auth, error: authError } = await context.supabase.auth.getUser();
  if (authError || !auth.user) throw new Error('Please log in again.');
  const { data, error } = await context.supabase.from('profiles').select('id,name,phone,stream').eq('id', context.userId).single();
  if (error) throw new Error('Unable to load your account. Please try again.');
  return {...data,email:auth.user.email??''};
});
export const saveAccount = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => accountSchema.parse(input)).handler(async ({ data, context }) => {
  const { data: auth, error: authError } = await context.supabase.auth.getUser();
  if (authError || !auth.user) throw new Error('Please log in again.');
  const { data: profile, error } = await context.supabase.from('profiles').update(data).eq('id', context.userId).select('id,name,phone,stream').single();
  if (error) throw new Error('Unable to save your account. Please try again.');
  return profile;
});

export const deleteAccount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deleteAccountSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { deleteVerifiedAccount } = await import('./account-deletion.server');
    return deleteVerifiedAccount(context.userId, data.password, {
      getUser: async () => {
        const { data: auth, error } = await context.supabase.auth.getUser();
        return error ? null : auth.user;
      },
      verifyPassword: async (email, password) => {
        const { data: auth, error } = await context.supabase.auth.signInWithPassword({ email, password });
        return error ? null : auth.user?.id ?? null;
      },
      deleteUser: async id => {
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (error) throw new Error('Unable to delete your account. Please try again.');
      },
    });
  });