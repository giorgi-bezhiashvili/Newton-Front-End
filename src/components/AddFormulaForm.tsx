"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { postWithAuth } from "../api";
import type { FormulaData } from "../types";

const GRADES = [7, 8, 9, 10, 11, 12];

export function AddFormulaForm({ onAdded }: { onAdded: () => void }) {
  const { auth, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [equationText, setEquationText] = useState("");
  const [grade, setGrade] = useState<number>(7);
  const [url, setUrl] = useState("");
  const [urlName, setUrlName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!auth) return null;

  const resetForm = () => {
    setTopic("");
    setEquationText("");
    setGrade(7);
    setUrl("");
    setUrlName("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const equation = equationText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (equation.length === 0) {
      setError("დაამატეთ მინიმუმ ერთი ფორმულა");
      return;
    }

    setIsSubmitting(true);
    try {

await postWithAuth<FormulaData>(
  "formulas",
  {
    topic,
    equation,
    grade,
    url: url || undefined,
    urlName: urlName || undefined,
  }
);
      resetForm();
      setIsOpen(false);
      onAdded();
    } catch (err) {
      const message = err instanceof Error ? err.message : "დამატება ვერ მოხერხდა";
      if (message.includes("სესია ამოიწურა")) logout();
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="addCardWrapper">
      <button type="button" className="addCardToggle" onClick={() => setIsOpen((v) => !v)}>
        {isOpen ? "დახურვა" : "+ ახალი ფორმულის დამატება"}
      </button>

      {isOpen && (
        <form className="addCardForm" onSubmit={handleSubmit}>
          <input className="searchInput" placeholder="თემა" value={topic} onChange={(e) => setTopic(e.target.value)} required />
          <textarea
            className="searchInput addCardTextarea"
            placeholder="ფორმულები (თითო ხაზზე ერთი)"
            value={equationText}
            onChange={(e) => setEquationText(e.target.value)}
            required
          />

          <div className="addCardRow">
            <select className="searchInput" value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}-ე კლასი</option>
              ))}
            </select>
          </div>

          <div className="addCardRow">
            <input className="searchInput" placeholder="ბმული (არასავალდებულო)" value={url} onChange={(e) => setUrl(e.target.value)} />
            <input className="searchInput" placeholder="ბმულის სახელი" value={urlName} onChange={(e) => setUrlName(e.target.value)} />
          </div>

          {error && <p className="authError">{error}</p>}

          <button type="submit" className="authSubmitBtn" disabled={isSubmitting}>
            {isSubmitting ? "იტვირთება..." : "დამატება"}
          </button>
        </form>
      )}
    </div>
  );
}
