import { createFileRoute, Link } from '@tanstack/react-router';
import AuthScreen from '@/components/AuthScreen';
import { useAccount } from '@/components/AccountProvider';
import { Button } from '@/components/ui/button';
export const Route = createFileRoute('/auth')({
  component: AuthPage,
  head: () => ({ meta: [
    {title:'Log in or Sign up — ExamPlus'},
    {name:'description',content:'Create your ExamPlus account or log in with your phone number to prepare for Ethiopian Grade 12 exams.'},
    {property:'og:title',content:'Log in or Sign up — ExamPlus'},
    {property:'og:description',content:'Access your ExamPlus account with your phone number and password.'},
    {property:'og:type',content:'website'}, {name:'twitter:card',content:'summary_large_image'},
  ]}),
});
function AuthPage() {
  const {user,loading}=useAccount();
  if(loading) return <div className="min-h-dvh bg-background"/>;
  if(user) return <main className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center gap-5"><h1 className="text-2xl font-bold">ExamPlus</h1><Button asChild><Link to="/">Open exams</Link></Button></main>;
  return <AuthScreen/>;
}