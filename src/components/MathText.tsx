import katex from "katex";
import { useMemo } from "react";

/**
 * Renders text that may contain LaTeX segments wrapped in $...$ or $$...$$.
 * Plain text is rendered as-is; math is typeset with KaTeX.
 */
export default function MathText({
  children,
  className,
}: {
  children?: string | null;
  className?: string;
}) {
  const parts = useMemo(() => {
    const src = children ?? "";
    const out: { type: "text" | "math"; value: string; display: boolean }[] = [];
    const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      if (m.index > last) out.push({ type: "text", value: src.slice(last, m.index), display: false });
      out.push({ type: "math", value: (m[1] ?? m[2] ?? "").trim(), display: Boolean(m[1]) });
      last = m.index + m[0].length;
    }
    if (last < src.length) out.push({ type: "text", value: src.slice(last), display: false });
    return out;
  }, [children]);

  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.type === "text") return <span key={i}>{p.value}</span>;
        let html = "";
        try {
          html = katex.renderToString(p.value, {
            throwOnError: false,
            displayMode: p.display,
            output: "html",
          });
        } catch {
          return <span key={i}>{p.value}</span>;
        }
        return (
          <span
            key={i}
            className={p.display ? "block my-1 overflow-x-auto" : "inline-block align-middle"}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </span>
  );
}
