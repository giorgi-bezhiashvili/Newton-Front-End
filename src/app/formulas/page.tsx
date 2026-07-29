"use client";

import { CardsPage } from "../../components/cardPage";
import { FormulaCard } from "../../components/FormulaCard";
import { AddFormulaForm } from "../../components/AddFormulaForm";
import { useAuth } from "../../contexts/AuthContext";
import type { FormulaData } from "../../types";

export default function FormulasPage() {
  const { auth } = useAuth();

  return (
    <>
      <title>ფორმულები — Newton</title>
      <meta
        name="description"
        content="ფიზიკის ფორმულების კრებული კლასების მიხედვით."
      />

      <CardsPage<FormulaData>
        endpoint="formulas"
        renderCard={(card, refetch) => (
          <FormulaCard card={card} onChanged={refetch} />
        )}
        renderAddForm={
          auth?.role === "teacher"
            ? (onAdded) => <AddFormulaForm onAdded={onAdded} />
            : undefined
        }
        searchMatch={(card, searchLower, searchClean) => {
          const equationString = Array.isArray(card.equation)
            ? card.equation.join(" ").toLowerCase()
            : String(card.equation).toLowerCase();
          return (
            card.topic.toLowerCase().includes(searchLower) ||
            card.grade.toString().includes(searchLower) ||
            equationString.includes(searchLower) ||
            equationString.replace(/\s+/g, "").includes(searchClean)
          );
        }}
      />
    </>
  );
}
