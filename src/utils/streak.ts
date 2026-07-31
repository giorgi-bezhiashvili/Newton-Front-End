import { getWithAuth, postWithAuth } from "../api";

interface StreakResponse {
  streak: number;
  lastLogin: string | null;
}

export async function fetchDailyStreak(): Promise<number> {
  const data = await getWithAuth<StreakResponse>("streak");
  return data.streak;
}

export async function recordDailyStreakHit(): Promise<number> {
  const data = await postWithAuth<StreakResponse>("streak/update-streak", {});
  return data.streak;
}