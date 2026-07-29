"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useSaved, type SavedItemType } from "../contexts/SavedContext";

export function StarButton({ itemType, itemId }: { itemType: SavedItemType; itemId: string }) {
  const { isAuthenticated } = useAuth();
  const { isSaved, toggleSaved } = useSaved();
  const [isBusy, setIsBusy] = useState(false);
  const router = useRouter();
  const saved = isSaved(itemType, itemId);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isBusy) return;

    setIsBusy(true);
    try {
      await toggleSaved(itemType, itemId);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`cardStarBtn ${saved ? "saved" : ""}`}
      onClick={handleClick}
      disabled={isBusy}
      aria-pressed={saved}
      aria-label={saved ? "წაშალე შენახულებიდან" : "დაამატე შენახულებში"}
      title={saved ? "წაშალე შენახულებიდან" : "დაამატე შენახულებში"}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M12 2.5l2.9 6.06 6.6.79-4.9 4.6 1.28 6.55L12 17.3l-5.88 3.2 1.28-6.55-4.9-4.6 6.6-.79L12 2.5z"
          fill={saved ? "#FFD64D" : "none"}
          stroke={saved ? "#FFD64D" : "currentColor"}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}