import { getWithAuth, postWithAuth } from "../api";

interface StreakResponse {
  streak: number;
  lastLogin: string | null;
}

function getUTCMidnight(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

// Mirrors the backend's own lapse check (streakRoutes.ts update-streak) so
// the badge doesn't keep showing a stale non-zero streak between a missed
// day and the next quiz, which is the only other place streak gets touched.
function hasLapsed(lastLogin: string | null): boolean {
  if (!lastLogin) return false;
  const diffInDays = Math.floor(
    (getUTCMidnight(new Date()) - getUTCMidnight(new Date(lastLogin))) /
      (1000 * 60 * 60 * 24)
  );
  return diffInDays > 1;
}

export async function fetchDailyStreak(): Promise<number> {
  const data = await getWithAuth<StreakResponse>("streak");

  if (data.streak > 0 && hasLapsed(data.lastLogin)) {
    try {
      return await resetStreak();
    } catch {
      return data.streak;
    }
  }

  return data.streak;
}

export async function recordDailyStreakHit(): Promise<number> {
  const data = await postWithAuth<StreakResponse>("streak/update-streak", {});
  return data.streak;
}

export async function resetStreak(): Promise<number> {
  const data = await postWithAuth<StreakResponse>("streak/reset-streak", {});
  return data.streak;
}