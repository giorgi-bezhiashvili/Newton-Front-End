"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getWithAuth, postWithAuth, deleteWithAuth } from "../api";
import type { FormulaData, ProjectData, QuizData } from "../types";

export type SavedItemType = "formula" | "project" | "quiz";

interface SavedResponse {
  formulas: FormulaData[];
  projects: ProjectData[];
  quizzes: QuizData[];
}

interface SavedContextValue {
  savedData: SavedResponse;
  isLoading: boolean;
  isSaved: (itemType: SavedItemType, itemId: string) => boolean;
  toggleSaved: (itemType: SavedItemType, itemId: string) => Promise<void>;
  refetchSaved: () => Promise<void>;
}

const emptyData: SavedResponse = { formulas: [], projects: [], quizzes: [] };

function emptyIds(): Record<SavedItemType, Set<string>> {
  return { formula: new Set(), project: new Set(), quiz: new Set() };
}

const SavedContext = createContext<SavedContextValue | undefined>(undefined);

export function SavedProvider({ children }: { children: ReactNode }) {
  const { auth, logout } = useAuth();
  const [savedIds, setSavedIds] = useState<Record<SavedItemType, Set<string>>>(emptyIds);
  const [savedData, setSavedData] = useState<SavedResponse>(emptyData);
  const [isLoading, setIsLoading] = useState(false);

  const refetchSaved = useCallback(async () => {
    if (!auth) {
      setSavedIds(emptyIds());
      setSavedData(emptyData);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getWithAuth<SavedResponse>("saved");
      setSavedData(data);
      setSavedIds({
        formula: new Set(data.formulas.map((f) => f._id)),
        project: new Set(data.projects.map((p) => p._id)),
        quiz: new Set(data.quizzes.map((q) => q._id)),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("სესია ამოიწურა")) logout();
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  useEffect(() => {
    refetchSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.userName]);

  const isSaved = useCallback(
    (itemType: SavedItemType, itemId: string) => savedIds[itemType].has(itemId),
    [savedIds]
  );

  const toggleSaved = useCallback(
    async (itemType: SavedItemType, itemId: string) => {
      if (!auth) return;
      const currentlySaved = savedIds[itemType].has(itemId);

      // Optimistic toggle so the star responds instantly.
      setSavedIds((prev) => {
        const nextSet = new Set(prev[itemType]);
        if (currentlySaved) nextSet.delete(itemId);
        else nextSet.add(itemId);
        return { ...prev, [itemType]: nextSet };
      });

      try {
        if (currentlySaved) {
          await deleteWithAuth(`saved/${itemType}/${itemId}`);
        } else {
          await postWithAuth("saved", { itemType, itemId });
        }
        await refetchSaved();
      } catch (err) {
        // Roll back on failure.
        setSavedIds((prev) => {
          const nextSet = new Set(prev[itemType]);
          if (currentlySaved) nextSet.add(itemId);
          else nextSet.delete(itemId);
          return { ...prev, [itemType]: nextSet };
        });
        const message = err instanceof Error ? err.message : "";
        if (message.includes("სესია ამოიწურა")) logout();
      }
    },
    [auth, savedIds, refetchSaved, logout]
  );

  return (
    <SavedContext.Provider value={{ savedData, isLoading, isSaved, toggleSaved, refetchSaved }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}