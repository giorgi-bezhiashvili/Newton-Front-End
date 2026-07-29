"use client";

import type { ReactNode } from "react";
import Header from "./header";
import Footer from "./footer";
import { GradeFilter } from "./gradeFilter";
import { useCardsList } from "../hooks/useCardsList";
import { RevealOnScroll } from "./RevealOnScroll";

function DefaultSkeleton() {
  return (
    <div className="card cardSkeleton">
      <div>
        <div className="skeletonLine skeletonTitle" />
        <div className="skeletonLine" />
        <div className="skeletonLine skeletonShort" />
      </div>
      <div className="cardFooter">
        <div className="skeletonLine skeletonTag" />
      </div>
    </div>
  );
}

interface CardsPageProps<T> {
  endpoint: string;
  searchMatch: (item: T, searchLower: string, searchClean: string) => boolean;
  renderCard: (item: T, refetch: () => void) => ReactNode;
  searchPlaceholder?: string;
  gradeOptions?: number[];
  renderAddForm?: (onAdded: () => void) => ReactNode;
}

export function CardsPage<T extends { _id: string; grade: number }>({
  endpoint,
  searchMatch,
  renderCard,
  searchPlaceholder = "ძებნა (მაგ: თემა, კლასი)...",
  gradeOptions = [7,8,9, 10,11,12],
  renderAddForm,
}: CardsPageProps<T>) {
  const {
    isLoading,
    searchInput,
    setSearchInput,
    gradeFilter,
    setGradeFilter,
    filteredCards,
    visibleCards,
    hasMore,
    sentinelRef,
    refetch,
  } = useCardsList<T>({ endpoint, searchMatch });

  return (
    <div className="space-page">
      <Header />
      <main className="mainContent">
        {renderAddForm?.(refetch)}

        <div className="searchWrapper">
          <input
            type="text"
            className="searchInput"
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <GradeFilter value={gradeFilter} onChange={setGradeFilter} options={gradeOptions} />

        <div className="cardsContainer">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i}>{DefaultSkeleton()}</div>)
          ) : filteredCards.length > 0 ? (
            visibleCards.map((item) => (
              <RevealOnScroll key={item._id}>{renderCard(item, refetch)}</RevealOnScroll>
            ))
          ) : (
            <div className="noResults">
              <p>შესაბამისი მასალა ვერ მოიძებნა</p>
            </div>
          )}
        </div>

        {hasMore && (
          <div ref={sentinelRef} className="loadMoreSentinel">
            {DefaultSkeleton()}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}