import { useState, type FormEvent } from 'react';
import { ArrowLeft, Save, Lock, CheckCheck, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount } from './AccountProvider';
import { PasswordField, accountInput } from './AuthScreen';
import { saveAccount, deleteAccount } from '@/lib/account.functions';
import { useServerFn } from '@tanstack/react-start';
import { clearDeletedStudyAccount } from '@/lib/study-account';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { accountSchema, changePasswordSchema } from '@/lib/account-validation';

export default function AccountSettingsScreen({onBack,onSaved,onStreamChange,currentStream}:{currentStream:'natural'|'social';onBack:()=>void;onSaved:(name:string,phone:string,stream:'natural'|'social')=>void;onStreamChange:(stream:'natural'|'social')=>void}) {
  const {user,profile,updateProfile}=useAccount();
  const signInMsg='Please sign in to save your info.';
  const [name,setName]=useState(profile?.name??''); const [phone,setPhone]=useState(profile?.phone??'');
  const [stream,setStream]=useState<'natural'|'social'>(currentStream);
  const [changePassword,setChangePassword]=useState(false); const [current,setCurrent]=useState(''); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState('');
  const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [notice,setNotice]=useState('');
  const [passwordBusy,setPasswordBusy]=useState(false); const [passwordError,setPasswordError]=useState(''); const [passwordNotice,setPasswordNotice]=useState('');
  const [deleteOpen,setDeleteOpen]=useState(false); const [deletePassword,setDeletePassword]=useState('');
  const [deleteBusy,setDeleteBusy]=useState(false); const [deleteError,setDeleteError]=useState('');
  const deleteAccountFn=useServerFn(deleteAccount);
  async function removeAccount(event:FormEvent) {
    event.preventDefault();
    if(!user || deleteBusy) return;
    setDeleteBusy(true);setDeleteError('');
    try {
      await deleteAccountFn({data:{password:deletePassword,confirmation:'DELETE'}});
    } catch(err) {
      setDeleteError(err instanceof Error?err.message:'Unable to delete your account. Please try again.');
      setDeleteBusy(false);return;
    }
    try { clearDeletedStudyAccount(user.id); } catch {}
    await supabase.auth.signOut({scope:'local'}).catch(()=>undefined);
    window.location.replace('/');
  }
  async function save(event:FormEvent) {
    event.preventDefault();setError('');setNotice('');
    if(!user){setError(signInMsg);return;}
    const parsed=accountSchema.safeParse({name,stream,phone});
    if(!parsed.success){setError(parsed.error.issues[0]?.message??'Check your details.');return;}
    setBusy(true);
    try {
      const saved=await saveAccount({data:parsed.data});
      const savedPhone=saved.phone;
      updateProfile({...saved,email:profile?.email??''});
      onSaved(saved.name,savedPhone,parsed.data.stream);setPhone(savedPhone);setNotice('Account updated successfully.');
    } catch(err){setError(err instanceof Error?err.message:'Could not save your changes.');}
    finally{setBusy(false);}
  }
  async function updatePassword(event:FormEvent) {
    event.preventDefault();setPasswordError('');setPasswordNotice('');
    if(!user){setPasswordError(signInMsg);return;}
    const parsed=changePasswordSchema.safeParse({current,password,confirm});
    if(!parsed.success){setPasswordError(parsed.error.issues[0]?.message??'Check your passwords.');return;}
    setPasswordBusy(true);
    try {
      // Verify the old password even on projects that do not require it for updateUser.
      const {data:auth}=await supabase.auth.getUser();
      if(!auth.user?.email) throw new Error('Please log in again before changing your password.');
      const verification=await supabase.auth.signInWithPassword({email:auth.user.email,password:current});
      if(verification.error) throw new Error('Your current password is incorrect.');
      const {error:updateError}=await supabase.auth.updateUser({password,current_password:current});
      if(updateError) throw updateError;
      setCurrent('');setPassword('');setConfirm('');setPasswordNotice('Password changed successfully.');
    }catch(err){setPasswordError(err instanceof Error?err.message:'Could not change your password.');}
    finally{setPasswordBusy(false);}
  }
  return <div className="flex flex-col gap-5 pb-6 text-foreground"><header className="flex items-center gap-3 pt-2"><Button variant="outline" size="icon" onClick={onBack} aria-label="Back to Profile"><ArrowLeft/></Button><h1 className="text-xl font-bold">Account Settings</h1></header>
    <form noValidate onSubmit={save} className="space-y-4">
      <div className="space-y-2"><label htmlFor="account-name" className="block text-sm font-medium">Full name</label><input id="account-name" value={name} onChange={e=>setName(e.target.value)} autoComplete="name" required maxLength={100} className={accountInput}/></div>
      <div className="space-y-2"><label htmlFor="account-phone" className="block text-sm font-medium">Phone number</label><input id="account-phone" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} autoComplete="tel" maxLength={32} className={accountInput}/></div>
      <fieldset><legend className="text-sm font-medium mb-2">Stream</legend><div className="grid grid-cols-2 gap-2">{(['natural','social'] as const).map(s=><Button key={s} type="button" variant={stream===s?'default':'secondary'} aria-pressed={stream===s} onClick={()=>{setStream(s);if(!user){onStreamChange(s);setError('');setNotice(`Stream changed to ${s==='natural'?'Natural':'Social'}.`);}}}>{s==='natural'?'🔬 Natural':'🌐 Social'}</Button>)}</div></fieldset>
      {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}{notice&&<p role="status" className="text-sm text-activity flex gap-2"><CheckCheck size={16}/>{notice}</p>}
      <Button disabled={busy} type="submit" className="w-full h-11">{busy?<Loader2 className="animate-spin"/>:<Save/>}Save Changes</Button>
    </form>
    <div className="border-t border-border pt-5"><Button type="button" variant="outline" className="w-full justify-start h-11" aria-expanded={changePassword} onClick={()=>setChangePassword(!changePassword)}><Lock/>Change password</Button>
    {changePassword&&<form onSubmit={updatePassword} className="space-y-4 mt-5"><PasswordField id="current-password" label="Current password" value={current} onChange={setCurrent} autoComplete="current-password"/><PasswordField id="new-password" label="New password" value={password} onChange={setPassword}/><PasswordField id="confirm-password" label="Confirm new password" value={confirm} onChange={setConfirm}/>{passwordError&&<p role="alert" className="text-sm text-destructive">{passwordError}</p>}{passwordNotice&&<p role="status" className="text-sm text-activity">{passwordNotice}</p>}<Button type="submit" disabled={passwordBusy} className="w-full h-11">{passwordBusy?<Loader2 className="animate-spin"/>:<Lock/>}Update password</Button></form>}</div>
    {user&&<div className="border-t border-border pt-5"><Button type="button" variant="outline" className="w-full justify-start h-11 text-destructive" onClick={()=>{setDeletePassword('');setDeleteError('');setDeleteOpen(true);}}><Trash2/>Delete Account</Button></div>}
    <AlertDialog open={deleteOpen} onOpenChange={open=>{if(!deleteBusy)setDeleteOpen(open);}}>
      <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md rounded-lg">
        <AlertDialogHeader><AlertDialogTitle>Delete your account?</AlertDialogTitle><AlertDialogDescription>Your account and profile will be permanently deleted, along with your saved study progress on this device. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
        <form onSubmit={removeAccount} className="space-y-4">
          <PasswordField id="delete-account-password" label="Confirm your password" value={deletePassword} onChange={setDeletePassword} autoComplete="current-password"/>
          {deleteError&&<p role="alert" className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter><Button type="button" variant="outline" disabled={deleteBusy} onClick={()=>setDeleteOpen(false)}>Cancel</Button><Button type="submit" variant="destructive" disabled={deleteBusy||!deletePassword}>{deleteBusy?<Loader2 className="animate-spin"/>:<Trash2/>}{deleteBusy?'Deleting…':'Delete permanently'}</Button></AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  </div>;
}