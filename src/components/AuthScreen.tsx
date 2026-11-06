import { useState, type FormEvent, type ReactNode } from 'react';
import { BookOpen, ArrowRight, Eye, EyeOff, Loader2, Mail, Lock, User, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { signupSchema, loginSchema } from '@/lib/account-validation';

export const accountInput = 'w-full min-w-0 rounded-lg border border-border bg-muted px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring';
export function PasswordField({id,label,value,onChange,autoComplete='new-password'}:{id:string;label:string;value:string;onChange:(value:string)=>void;autoComplete?:string}) {
  const [visible,setVisible] = useState(false);
  return <div className="space-y-2"><label htmlFor={id} className="block text-sm font-medium">{label}</label><div className="relative"><input id={id} type={visible?'text':'password'} value={value} onChange={e=>onChange(e.target.value)} autoComplete={autoComplete} required maxLength={128} className={`${accountInput} pr-12`}/><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1" aria-label={visible?'Hide password':'Show password'} title={visible?'Hide password':'Show password'} onClick={()=>setVisible(!visible)}>{visible?<EyeOff/>:<Eye/>}</Button></div></div>;
}

function Field({id,label,icon,children}:{id:string;label:string;icon:ReactNode;children:ReactNode}) {
  return <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
    <div className="group relative flex items-center rounded-2xl border border-border bg-card shadow-sm transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
      <span className="pl-4 text-muted-foreground transition-colors group-focus-within:text-primary">{icon}</span>
      {children}
    </div>
  </div>;
}
const fieldInput='w-full min-w-0 bg-transparent px-3 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60';

function strength(p:string){let s=0;if(p.length>=8)s++;if(/[A-Z]/.test(p)&&/[a-z]/.test(p))s++;if(/\d/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;return s;}

export default function AuthScreen() {
  const [signup,setSignup]=useState(false);
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [visible,setVisible]=useState(false);
  const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [notice,setNotice]=useState('');
  const navigate=useNavigate();
  const score=strength(password);
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
      if (!result.data.session) {setNotice('Account created. Please log in.');setSignup(false);return;}
      setPassword(''); await navigate({to:'/',replace:true});
    } catch {setError('Unable to connect. Please try again.');}
    finally {setBusy(false);}
  }
  const switchMode=(v:boolean)=>{setSignup(v);setError('');setNotice('');};
  return <main className="min-h-dvh bg-background text-foreground flex justify-center">
    <div className="relative w-full max-w-[390px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative px-6 pt-8 pb-14 bg-primary text-primary-foreground rounded-b-[2.5rem] overflow-hidden">
        <motion.div aria-hidden className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-foreground/10" animate={{scale:[1,1.15,1]}} transition={{duration:6,repeat:Infinity}}/>
        <motion.div aria-hidden className="absolute bottom-0 -left-12 w-32 h-32 rounded-full bg-primary-foreground/10" animate={{scale:[1.1,1,1.1]}} transition={{duration:7,repeat:Infinity}}/>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5"><div className="bg-primary-foreground/20 p-2.5 rounded-2xl backdrop-blur"><BookOpen size={22}/></div><span className="text-xl font-bold">ExamPlus</span></div>
          <a href="/" aria-label="Skip and continue as guest" className="flex items-center gap-1 text-xs font-semibold bg-primary-foreground/15 rounded-full px-3 py-1.5">Skip<X size={14}/></a>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={String(signup)} className="relative mt-8" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
            <h1 className="text-3xl font-extrabold">{signup?'Create account':'Welcome back'}</h1>
            <p className="mt-1.5 text-sm text-primary-foreground/80">{signup?'Save your progress and practice anywhere.':'Log in to continue your exam prep.'}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Card */}
      <div className="relative -mt-8 mx-4 bg-card rounded-3xl border border-border shadow-lg p-5 flex flex-col gap-5">
        <div className="relative grid grid-cols-2 bg-muted p-1 rounded-2xl" role="tablist" aria-label="Account access">
          <motion.div aria-hidden className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-card shadow-sm" animate={{left:signup?'50%':'4px'}} transition={{type:'spring',stiffness:400,damping:32}}/>
          {[false,true].map(v=><button key={String(v)} type="button" role="tab" aria-selected={signup===v} disabled={busy} onClick={()=>switchMode(v)} className={`relative z-10 py-2.5 text-sm font-semibold transition-colors ${signup===v?'text-foreground':'text-muted-foreground'}`}>{v?'Sign up':'Log in'}</button>)}
        </div>

        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {signup&&<motion.div key="name" initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="overflow-hidden">
              <Field id="signup-name" label="Full name" icon={<User size={18}/>}><input id="signup-name" autoComplete="name" maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Abebe Kebede" className={fieldInput}/></Field>
            </motion.div>}
          </AnimatePresence>
          <Field id="auth-email" label="Email" icon={<Mail size={18}/>}><input id="auth-email" type="email" autoComplete="email" maxLength={255} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className={fieldInput}/></Field>
          <div>
            <Field id="auth-password" label="Password" icon={<Lock size={18}/>}>
              <input id="auth-password" type={visible?'text':'password'} autoComplete={signup?'new-password':'current-password'} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} placeholder={signup?'At least 8 characters':'Your password'} className={fieldInput}/>
              <button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?'Hide password':'Show password'} className="pr-4 text-muted-foreground hover:text-foreground">{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button>
            </Field>
            {signup&&password&&<div className="mt-2 flex gap-1" aria-label={`Password strength ${score} of 4`}>{[0,1,2,3].map(i=><motion.div key={i} className={`h-1 flex-1 rounded-full ${i<score?(score<2?'bg-destructive':score<4?'bg-primary/60':'bg-primary'):'bg-muted'}`} initial={{scaleX:0}} animate={{scaleX:1}}/>)}</div>}
          </div>

          <AnimatePresence>
            {error&&<motion.p key="e" role="alert" initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2.5"><AlertCircle size={16}/>{error}</motion.p>}
            {notice&&<motion.p key="n" role="status" initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-xl px-3 py-2.5"><CheckCircle2 size={16}/>{notice}</motion.p>}
          </AnimatePresence>

          <motion.div whileTap={{scale:0.98}}>
            <Button type="submit" disabled={busy} className="w-full h-12 rounded-2xl text-base font-semibold shadow-md">{busy?<Loader2 className="animate-spin"/>:null}{busy?'Please wait…':signup?'Create account':'Log in'}{!busy&&<ArrowRight/>}</Button>
          </motion.div>
        </form>

        <p className="text-sm text-center text-muted-foreground">{signup?'Already have an account?':"Don't have an account?"} <button type="button" onClick={()=>switchMode(!signup)} className="font-semibold text-primary">{signup?'Log in':'Sign up'}</button></p>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-auto py-6">Ethiopian Grade 12 exam preparation</p>
    </div>
  </main>;
}
