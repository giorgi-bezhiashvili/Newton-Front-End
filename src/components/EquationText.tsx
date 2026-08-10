"use client";

import { useMemo, type ReactNode } from "react";

// Turns "G*m1m2" or "G m1m2" into "G · m1 · m2" for display.
function formatMultiplication(raw: string): string {
  let s = raw.trim().replace(/\s+/g, " ");
  s = s.replace(/\*/g, "·");
  s = s.replace(/(\d)([a-zA-Zა-ჰ])/g, "$1·$2");
  s = s.split(" ").join("·");
  s = s.replace(/\s*·\s*/g, " · ");
  return s;
}

function RenderFactor({ token }: { token: string }) {
  if (token.includes("/")) {
    const [numerator, denominator] = token.split("/");
    return (
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          verticalAlign: "middle",
          padding: "0 6px",
          minWidth: "50px",
        }}
      >
        <span
          style={{
            borderBottom: "1px solid currentColor",
            padding: "2px 6px",
            fontSize: "0.95em",
            textAlign: "center",
            width: "100%",
          }}
        >
          {formatMultiplication(numerator)}
        </span>
        <span
          style={{
            fontSize: "0.95em",
            paddingTop: "4px",
            textAlign: "center",
            width: "100%",
          }}
        >
          {formatMultiplication(denominator)}
        </span>
      </span>
    );
  }
  return (
    <span style={{ padding: "0 4px" }}>{formatMultiplication(token)}</span>
  );
}

function RenderFraction({ text }: { text: string }) {
  let cleanText = text.trim();
  let multiplier = "";

  const parenFractionMatch = cleanText.match(/^\(([^)]+)\)\s*\*?\s*(.*)$/);
  if (parenFractionMatch) {
    cleanText = parenFractionMatch[1];
    multiplier = parenFractionMatch[2];
  }

  const tokens = cleanText.split(/\s+/).filter(Boolean);

  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap" }}
    >
      {tokens.map((token, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
          {i > 0 && <span style={{ padding: "0 2px" }}>·</span>}
          <RenderFactor token={token} />
        </span>
      ))}
      {multiplier && (
        <span style={{ paddingLeft: "4px" }}>
          {formatMultiplication(multiplier)}
        </span>
      )}
    </span>
  );
}

// ---- Custom LaTeX-ish renderer (no external dependency) ----
export function isLatexLike(text: string): boolean {
  return /\\(frac|sqrt|cdot|times)/.test(text) || /[_^]/.test(text);
}

function readGroup(input: string, start: number): [string, number] {
  let i = start;
  while (input[i] === " ") i++;
  if (input[i] === "{") {
    let depth = 1;
    let j = i + 1;
    while (j < input.length && depth > 0) {
      if (input[j] === "{") depth++;
      else if (input[j] === "}") depth--;
      j++;
    }
    return [input.slice(i + 1, j - 1), j];
  }
  if (input[i] === "\\") {
    const m = input.slice(i).match(/^\\[a-zA-Z]+/);
    if (m) return [m[0], i + m[0].length];
  }
  return [input[i] ?? "", i + 1];
}
const SYMBOL_COMMANDS: Record<string, string> = {
  circ: "°",
  pm: "±",
  mp: "∓",
  le: "≤",
  ge: "≥",
  neq: "≠",
  approx: "≈",
  infty: "∞",
  pi: "π",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  Delta: "Δ",
  theta: "θ",
  omega: "ω",
};
function parseLatexNodes(input: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < input.length) {
    const ch = input[i];

    if (ch === "\\") {
      const cmdMatch = input.slice(i).match(/^\\([a-zA-Z]+)/);
      if (cmdMatch) {
        const cmd = cmdMatch[1];
        i += cmdMatch[0].length;

        if (cmd === "frac") {
          const [num, afterNum] = readGroup(input, i);
          const [den, afterDen] = readGroup(input, afterNum);
          nodes.push(
            <span
              key={key++}
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                verticalAlign: "middle",
                padding: "0 6px",
              }}
            >
              <span
                style={{
                  borderBottom: "1px solid currentColor",
                  padding: "0 4px",
                  fontSize: "0.9em",
                }}
              >
                {parseLatexNodes(num)}
              </span>
              <span style={{ fontSize: "0.9em", paddingTop: "2px" }}>
                {parseLatexNodes(den)}
              </span>
            </span>,
          );
          i = afterDen;
          continue;
        }

        if (cmd === "sqrt") {
          const [content, afterContent] = readGroup(input, i);
          nodes.push(
            <span
              key={key++}
              style={{ display: "inline-flex", alignItems: "flex-start" }}
            >
              <span style={{ marginRight: "1px" }}>√</span>
              <span
                style={{
                  borderTop: "1px solid currentColor",
                  paddingTop: "1px",
                }}
              >
                {parseLatexNodes(content)}
              </span>
            </span>,
          );
          i = afterContent;
          continue;
        }

        if (cmd === "cdot" || cmd === "times") {
          nodes.push(
            <span key={key++} style={{ padding: "0 2px" }}>
              ·
            </span>,
          );
          continue;
        }

        if (SYMBOL_COMMANDS[cmd]) {
          nodes.push(<span key={key++}>{SYMBOL_COMMANDS[cmd]}</span>);
          continue;
        }

        if (cmd === "text") {
          const [content, afterContent] = readGroup(input, i);
          nodes.push(<span key={key++}>{content}</span>);
          i = afterContent;
          continue;
        }

        nodes.push(<span key={key++}>{cmd}</span>);
        continue;
      }
      i++;
      continue;
    }

    if (ch === "_") {
      const [sub, after] = readGroup(input, i + 1);
      nodes.push(
        <sub key={key++} style={{ fontSize: "0.75em" }}>
          {parseLatexNodes(sub)}
        </sub>,
      );
      i = after;
      continue;
    }

    if (ch === "^") {
      const [sup, after] = readGroup(input, i + 1);
      nodes.push(
        <sup key={key++} style={{ fontSize: "0.75em" }}>
          {parseLatexNodes(sup)}
        </sup>,
      );
      i = after;
      continue;
    }

    if (ch === "{") {
      const [content, after] = readGroup(input, i);
      nodes.push(<span key={key++}>{parseLatexNodes(content)}</span>);
      i = after;
      continue;
    }

    let j = i;
    while (j < input.length && !"\\_^{".includes(input[j])) j++;
    nodes.push(<span key={key++}>{input.slice(i, j)}</span>);
    i = j;
  }

  return nodes;
}

function ProcessEquation({ text }: { text: string }) {
  let prefix = "";
  let targetText = text;

  const match = text.match(/^([ა-ჰ\s]+)(.*)$/);
  if (match) {
    prefix = match[1];
    targetText = match[2];
  }

  if (isLatexLike(targetText)) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        {prefix && (
          <span style={{ color: "#a0aec0", marginRight: "4px" }}>
            {prefix.trim()}
          </span>
        )}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontStyle: "italic",
          }}
        >
          {parseLatexNodes(targetText.trim())}
        </span>
      </span>
    );
  }

  if (targetText.includes("=")) {
    const parts = targetText.split("=");
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        {prefix && (
          <span style={{ color: "#a0aec0", marginRight: "4px" }}>
            {prefix.trim()}
          </span>
        )}
        {parts.flatMap((part, i) =>
          i < parts.length - 1
            ? [
                <RenderFraction key={`f-${i}`} text={part} />,
                <span key={`eq-${i}`} style={{ padding: "0 4px" }}>
                  =
                </span>,
              ]
            : [<RenderFraction key={`f-${i}`} text={part} />],
        )}
      </span>
    );
  }

  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap" }}
    >
      {prefix && (
        <span style={{ color: "#a0aec0", marginRight: "4px" }}>
          {prefix.trim()}
        </span>
      )}
      <RenderFraction text={targetText} />
    </span>
  );
}

/**
 * Public: formats a single line of text that may contain equations/LaTeX-ish
 * markup ("label:", \frac{}{}, \sqrt{}, _sub, ^sup, "=", fractions with "/").
 * Falls back to rendering plain text untouched.
 */
export function FormatEquation({ text }: { text: string }) {
  const content = useMemo(() => {
    if (text.includes(":")) {
      const [labelText, equationText] = text.split(":");
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            width: "100%",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: "0.95em",
              color: "#a0aec0",
              textAlign: "center",
            }}
          >
            {labelText.trim()}:
          </span>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ProcessEquation text={equationText} />
          </div>
        </div>
      );
    }
    return <ProcessEquation text={text} />;
  }, [text]);

  return content;
}
function MathSpan({ text }: { text: string }) {
  const trimmed = text.trim();
  if (isLatexLike(trimmed)) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontStyle: "italic",
        }}
      >
        {parseLatexNodes(trimmed)}
      </span>
    );
  }
  if (trimmed.includes("=")) {
    const parts = trimmed.split("=");
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        {parts.flatMap((part, i) =>
          i < parts.length - 1
            ? [
                <RenderFraction key={`f-${i}`} text={part} />,
                <span key={`eq-${i}`} style={{ padding: "0 4px" }}>
                  =
                </span>,
              ]
            : [<RenderFraction key={`f-${i}`} text={part} />],
        )}
      </span>
    );
  }
  return <RenderFraction text={trimmed} />;
}

// Splits on $$...$$ (block) / $...$ (inline). Text outside those markers is
// left completely untouched — no dot-multiplication, no fraction splitting —
// so ordinary sentences render as normal prose.
function splitMathSegments(
  input: string,
): { type: "text" | "math"; value: string }[] {
  const segments: { type: "text" | "math"; value: string }[] = [];
  const regex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: input.slice(lastIndex, match.index),
      });
    }
    segments.push({ type: "math", value: match[1] ?? match[2] ?? "" });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < input.length) {
    segments.push({ type: "text", value: input.slice(lastIndex) });
  }
  if (segments.length === 0) segments.push({ type: "text", value: input });
  return segments;
}
// Matches a run of LaTeX-ish tokens with no whitespace between them, e.g.
// "\text{ მმ}", "^\circ", "_{max}" — so these render even without $ wrapping.
const BARE_LATEX_RUN =
  /(?:\\[a-zA-Z]+(?:\{[^{}]*\})*|[_^](?:\{[^{}]*\}|\\[a-zA-Z]+|[^\s{}]))+/g;

function BareLatex({ text }: { text: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {parseLatexNodes(text)}
    </span>
  );
}

function splitBareLatex(text: string): { type: "text" | "bare"; value: string }[] {
  const segments: { type: "text" | "bare"; value: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  BARE_LATEX_RUN.lastIndex = 0;

  while ((match = BARE_LATEX_RUN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "bare", value: match[0] });
    lastIndex = BARE_LATEX_RUN.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }
  return segments;
}
export function RichText({ text }: { text: string }) {
  const segments = useMemo(() => splitMathSegments(text), [text]);
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === "math" ? (
          <MathSpan key={i} text={seg.value} />
        ) : (
          splitBareLatex(seg.value).map((sub, j) =>
            sub.type === "bare" ? (
              <BareLatex key={`${i}-${j}`} text={sub.value} />
            ) : (
              <span key={`${i}-${j}`} style={{ whiteSpace: "pre-wrap" }}>
                {sub.value}
              </span>
            ),
          )
        ),
      )}
    </>
  );
}