import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getAccount } from '@/lib/account.functions';
import { activateStudyAccount } from '@/lib/study-account';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

export type AccountProfile = Awaited<ReturnType<typeof getAccount>>;
const AccountContext = createContext<{ user: User | null; profile: AccountProfile | null; loading: boolean; error: string; reload: () => Promise<void>; signOut: () => Promise<void> } | null>(null);
export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const router = useRouter();
  async function reload() {
    setLoading(true); setError('');
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError && data.user) throw authError;
      setUser(data.user);
      if (data.user) {
        activateStudyAccount(data.user.id);
        setProfile(await getAccount());
      } else setProfile(null);
    } catch { setError('Your account could not be loaded. Please try again.'); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    void reload();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (!['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event)) return;
      // Supabase callbacks must finish before making further auth requests.
      setTimeout(() => { void reload(); void router.invalidate(); if (event !== 'SIGNED_OUT') void queryClient.invalidateQueries(); }, 0);
    });
    return () => subscription.unsubscribe();
  }, []);
  async function signOut() {
    await queryClient.cancelQueries(); queryClient.clear();
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) throw logoutError;
    setUser(null); setProfile(null);
    await router.navigate({ to: '/auth', replace: true });
  }
  return <AccountContext.Provider value={{user,profile,loading,error,reload,signOut}}>{children}</AccountContext.Provider>;
}
export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error('Account provider is required');
  return context;
}