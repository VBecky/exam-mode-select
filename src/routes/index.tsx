import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import EthioMatricApp from "@/components/EthioMatricApp";
import { loadRemoteQuestions } from "@/lib/exam-questions";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "EthioMatric+ — Ethiopian Grade 12 Matric Exam Practice" },
      {
        name: "description",
        content:
          "Practice Ethiopian Grade 12 national exam papers by subject and year, with practice mode feedback, timed exam mode, and progress tracking.",
      },
      { property: "og:title", content: "EthioMatric+ — Ethiopian Grade 12 Matric Exam Practice" },
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

  if (!ready) {
    return <div style={{ minHeight: "100vh", background: "#e8e4f5" }} />;
  }
  return <EthioMatricApp />;
}
