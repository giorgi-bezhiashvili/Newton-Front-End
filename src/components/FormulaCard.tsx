"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormulaData } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { patchWithAuth, deleteWithAuth } from "../api";
import { StarButton } from "./StarButton";
import type { ReactNode } from "react";

const GRADES = [7, 8, 9, 10, 11, 12];

// Turns "G*m1m2" or "G m1m2" into "G · m1 · m2" for display.
// Explicit "*" is a multiplication sign; a digit immediately followed by a
// letter (e.g. the boundary inside "m1m2") is treated as an implied one too.
function formatMultiplication(raw: string): string {
  let s = raw.trim().replace(/\s+/g, " ");
  s = s.replace(/\*/g, "·");
  s = s.replace(/(\d)([a-zA-Zა-ჰ])/g, "$1·$2");
  s = s.split(" ").join("·");
  s = s.replace(/\s*·\s*/g, " · ");
  return s;
}

// Renders a single space-separated factor: a fraction if it has a "/", plain text otherwise.
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

  // A space at the top level just means multiplication (e.g. "G m1m2/r²" is
  // G times the fraction m1m2/r² — G should NOT end up inside the fraction).
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
// Supports: \frac{a}{b}, \sqrt{a}, \cdot, \times, _{sub} / _x, ^{sup} / ^x
// Falls back to plain text for anything else.

function isLatexLike(text: string): boolean {
  return /\\(frac|sqrt|cdot|times)/.test(text) || /[_^]/.test(text);
}

// Reads a {...} group starting at index i (balanced braces), or if there's
// no brace, reads just the single next character as the argument.
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
  return [input[i] ?? "", i + 1];
}

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

        if (cmd === "text") {
          const [content, afterContent] = readGroup(input, i);
          nodes.push(<span key={key++}>{content}</span>);
          i = afterContent;
          continue;
        }

        // Unknown command — just show its name without the backslash
        nodes.push(<span key={key++}>{cmd}</span>);
        continue;
      }
      i++; // stray backslash, skip
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

    // Plain text run until the next special character
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

function FormatEquation({ text }: { text: string }) {
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

export function FormulaCard({
  card,
  onChanged,
}: {
  card: FormulaData;
  onChanged?: () => void;
}) {
  const { auth, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [topic, setTopic] = useState(card.topic);
  const [equationText, setEquationText] = useState(
    Array.isArray(card.equation)
      ? card.equation.join("\n")
      : String(card.equation),
  );
  const [grade, setGrade] = useState(card.grade);
  const [url, setUrl] = useState(card.url || "");
  const [urlName, setUrlName] = useState(card.urlName || "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!auth || auth.role !== "teacher") {
    return (
      <div className="card">
        <StarButton itemType="formula" itemId={card._id} />
        <div>
          <h2>{card.topic}</h2>
          <div className="equationsList">
            {Array.isArray(card.equation) ? (
              card.equation.map((eq, index) => (
                <p key={index} className="equationLine">
                  <FormatEquation text={String(eq)} />
                </p>
              ))
            ) : (
              <p className="equationLine">
                <FormatEquation text={String(card.equation)} />
              </p>
            )}
          </div>
        </div>
        <div className="cardFooter">
          <span className="gradeTag">{card.grade}-ე კლასი</span>
          {card.url && (
            <a
              href={card.url}
              className="cardLink"
              target="_blank"
              rel="noreferrer"
            >
              {card.urlName || "იხილეთ მეტი"}
            </a>
          )}
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setError(null);
    const equation = equationText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (equation.length === 0) {
      setError("დაამატეთ მინიმუმ ერთი ფორმულა");
      return;
    }
    setIsSaving(true);
    try {
      await patchWithAuth(`formulas/${card._id}`, {
        topic,
        equation,
        grade,
        url: url || undefined,
        urlName: urlName || undefined,
      });
      setIsEditing(false);
      onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "განახლება ვერ მოხერხდა";
      if (message.includes("სესია ამოიწურა")) logout();
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("წავშალო ეს ფორმულა?")) return;
    setError(null);
    setIsSaving(true);
    try {
      await deleteWithAuth(`formulas/${card._id}`);
      onChanged?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "წაშლა ვერ მოხერხდა";
      if (message.includes("სესია ამოიწურა")) logout();
      setError(message);
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="card">
        <form
          className="addCardForm"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <input
            className="searchInput"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
          <textarea
            className="searchInput addCardTextarea"
            value={equationText}
            onChange={(e) => setEquationText(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            required
          />
          <div className="addCardRow">
            <select
              className="searchInput"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}-ე კლასი
                </option>
              ))}
            </select>
          </div>
          <div className="addCardRow">
            <input
              className="searchInput"
              placeholder="ბმული"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <input
              className="searchInput"
              placeholder="ბმულის სახელი"
              value={urlName}
              onChange={(e) => setUrlName(e.target.value)}
            />
          </div>
          {error && <p className="authError">{error}</p>}
          <div className="addCardRow">
            <button type="submit" className="authSubmitBtn" disabled={isSaving}>
              {isSaving ? "იტვირთება..." : "შენახვა"}
            </button>
            <button
              type="button"
              className="addCardToggle"
              onClick={() => setIsEditing(false)}
            >
              გაუქმება
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card">
      <StarButton itemType="formula" itemId={card._id} />
      <div>
        <h2>{card.topic}</h2>
        <div className="equationsList">
          {Array.isArray(card.equation) ? (
            card.equation.map((eq, index) => (
              <p key={index} className="equationLine">
                <FormatEquation text={String(eq)} />
              </p>
            ))
          ) : (
            <p className="equationLine">
              <FormatEquation text={String(card.equation)} />
            </p>
          )}
        </div>
      </div>
      <div className="cardFooter">
        <span className="gradeTag">{card.grade}-ე კლასი</span>
        {card.url && (
          <a
            href={card.url}
            className="cardLink"
            target="_blank"
            rel="noreferrer"
          >
            {card.urlName || "იხილეთ მეტი"}
          </a>
        )}
      </div>
      {error && <p className="authError">{error}</p>}
      <div className="addCardRow">
        <button
          type="button"
          className="addCardToggle"
          onClick={() => setIsEditing(true)}
        >
          რედაქტირება
        </button>
        <button
          type="button"
          className="addCardToggle"
          onClick={handleDelete}
          disabled={isSaving}
        >
          წაშლა
        </button>
      </div>
    </div>
  );
}
