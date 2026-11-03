import { useState, type FormEvent } from 'react';
import { BookOpen, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { signupSchema, loginSchema } from '@/lib/account-validation';

export const accountInput = 'w-full min-w-0 rounded-lg border border-border bg-muted px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring';
export function PasswordField({id,label,value,onChange,autoComplete='new-password'}:{id:string;label:string;value:string;onChange:(value:string)=>void;autoComplete?:string}) {
  const [visible,setVisible] = useState(false);
  return <div className="space-y-2"><label htmlFor={id} className="block text-sm font-medium">{label}</label><div className="relative"><input id={id} type={visible?'text':'password'} value={value} onChange={e=>onChange(e.target.value)} autoComplete={autoComplete} required maxLength={128} className={`${accountInput} pr-12`}/><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1" aria-label={visible?'Hide password':'Show password'} title={visible?'Hide password':'Show password'} onClick={()=>setVisible(!visible)}>{visible?<EyeOff/>:<Eye/>}</Button></div></div>;
}
export default function AuthScreen() {
  const [signup,setSignup]=useState(false);
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [notice,setNotice]=useState('');
  const navigate=useNavigate();
  async function submit(event:FormEvent) {
    event.preventDefault(); setError(''); setNotice('');
    const parsed=signup?signupSchema.safeParse({name,email,password}):loginSchema.safeParse({email,password});
    if (!parsed.success) {setError(parsed.error.issues[0]?.message??'Check your details.');return;}
    setBusy(true);
    try {
      const result=signup
        ? await supabase.auth.signUp({email:parsed.data.email,password:parsed.data.password,options:{data:{name},emailRedirectTo:window.location.origin}})
        : await supabase.auth.signInWithPassword({email:parsed.data.email,password:parsed.data.password});
      if(result.error) {
        const message=result.error.message;
        if (/email not confirmed/i.test(message)) setError('Your email is not confirmed yet.');
        else if (/invalid login credentials/i.test(message)) setError('Email or password is incorrect.');
        else setError(message);
        return;
      }
      if (!result.data.session) {setNotice('Account created. Please log in.');return;}
      setPassword(''); await navigate({to:'/',replace:true});
    } catch {setError('Unable to connect. Please try again.');}
    finally {setBusy(false);}
  }
  return <main className="min-h-dvh bg-background text-foreground flex justify-center"><div className="w-full max-w-[390px] px-6 py-10 flex flex-col gap-8">
    <div className="flex items-center gap-3"><a href="/" className="text-sm text-muted-foreground mr-auto order-last">Skip</a><div className="bg-primary text-primary-foreground p-3 rounded-lg"><BookOpen size={26}/></div><span className="text-2xl font-bold">EthioExam</span></div>
    <div><h1 className="text-2xl font-bold">{signup?'Create your account':'Welcome back'}</h1><p className="mt-2 text-sm text-muted-foreground">{signup?'Your next chapter starts here.':'Ready for your next exam?'}</p></div>
    <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg" role="tablist" aria-label="Account access">{[false,true].map(value=><Button key={String(value)} role="tab" aria-selected={signup===value} variant={signup===value?'default':'ghost'} disabled={busy} onClick={()=>{setSignup(value);setError('');setNotice('');}}>{value?'Sign up':'Log in'}</Button>)}</div>
    <form onSubmit={submit} className="space-y-5">
      {signup&&<div className="space-y-2"><label htmlFor="signup-name" className="block text-sm font-medium">Full name</label><input id="signup-name" autoComplete="name" required maxLength={100} value={name} onChange={e=>setName(e.target.value)} className={accountInput}/></div>}
      <div className="space-y-2"><label htmlFor="auth-email" className="block text-sm font-medium">Email</label><input id="auth-email" type="email" autoComplete="email" required maxLength={255} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className={accountInput}/></div>
      <PasswordField id="auth-password" label="Password" value={password} onChange={setPassword} autoComplete={signup?'new-password':'current-password'}/>
      {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}{notice&&<p role="status" className="text-sm text-muted-foreground">{notice}</p>}
      <Button type="submit" disabled={busy} className="w-full h-12">{busy?<Loader2 className="animate-spin"/>:<ArrowRight/>}{busy?'Please wait…':signup?'Create account':'Log in'}</Button>
    </form>
    <p className="text-xs text-muted-foreground text-center mt-auto">Ethiopian Grade 12 exam preparation</p>
  </div></main>;
}