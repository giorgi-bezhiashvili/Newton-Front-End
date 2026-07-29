import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE } from "../api";

const BATCH_SIZE = 9;
const SEARCH_DEBOUNCE_MS = 200;

interface UseCardsListOptions<T> {
  endpoint: string;
  searchMatch: (item: T, searchLower: string, searchClean: string) => boolean;
}

export function useCardsList<T extends { _id: string; grade: number }>({
  endpoint,
  searchMatch,
}: UseCardsListOptions<T>) {
  const [cards, setCards] = useState<T[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null);

  const fetchCards = useCallback(async () => {
    if (!endpoint) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: T[] = await response.json();
      setCards(data);
      setVisibleCount(BATCH_SIZE);
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput);
      setVisibleCount(BATCH_SIZE);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const filteredCards = useMemo(() => {
    let result = cards;

    if (gradeFilter !== "all") {
      result = result.filter((card) => card.grade === gradeFilter);
    }

    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      const searchClean = searchLower.replace(/\s+/g, "");
      result = result.filter((card) => searchMatch(card, searchLower, searchClean));
    }

    return result;
  }, [cards, searchQuery, gradeFilter, searchMatch]);

  useEffect(() => {
    if (!sentinelNode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredCards.length));
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelNode);
    return () => observer.disconnect();
  }, [sentinelNode, filteredCards.length]);

  const handleGradeFilterChange = (newGrade: number | "all") => {
    setGradeFilter(newGrade);
    setVisibleCount(BATCH_SIZE);
  };

  const visibleCards = filteredCards.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCards.length;

  return {
    isLoading,
    searchInput,
    setSearchInput,
    gradeFilter,
    setGradeFilter: handleGradeFilterChange,
    filteredCards,
    visibleCards,
    hasMore,
    sentinelRef: setSentinelNode,
    refetch: fetchCards,
  };
}