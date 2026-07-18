import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import EthioMatricApp from "@/components/EthioMatricApp";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div style={{ minHeight: "100vh", background: "#e8e4f5" }} />;
  }
  return <EthioMatricApp />;
}
