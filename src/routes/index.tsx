import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ExamPlusApp from "@/components/ExamPlusApp";
import { loadRemoteQuestions } from "@/lib/exam-questions";
import { useAccount } from "@/components/AccountProvider";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ExamPlus — Ethiopian Grade 12 Matric Exam Practice" },
      {
        name: "description",
        content:
          "Practice Ethiopian Grade 12 national exam papers by subject and year, with practice mode feedback, timed exam mode, and progress tracking.",
      },
      { property: "og:title", content: "ExamPlus — Ethiopian Grade 12 Matric Exam Practice" },
      {
        property: "og:description",
        content:
          "Practice Ethiopian Grade 12 national exam papers by subject and year, with practice mode feedback, timed exam mode, and progress tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const {user,profile,loading,error,reload,signOut} = useAccount();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadRemoteQuestions().finally(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!ready || loading) return <div className="min-h-dvh bg-background" aria-label="Loading ExamPlus" />;
  if (user && (!profile || error)) return <main className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center gap-4 px-6"><p role="alert">{error||'Your account could not be loaded.'}</p><Button onClick={()=>void reload()}>Try again</Button><Button variant="outline" onClick={()=>void signOut()}>Sign out</Button></main>;
  return <ExamPlusApp key={user?.id ?? 'guest'} />;
}
