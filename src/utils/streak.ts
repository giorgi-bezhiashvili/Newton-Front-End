import { getWithAuth, postWithAuth } from "../api";

interface StreakResponse {
  streak: number;
  lastLogin: string | null;
}

/** Fetches the current daily streak for the logged-in user without changing it. */
export async function fetchDailyStreak(
  accessToken: string,
  refreshToken: string,
  onTokenRefreshed: (accessToken: string, refreshToken: string, role: string) => void
): Promise<number> {
  const data = await getWithAuth<StreakResponse>("streak", accessToken, refreshToken, onTokenRefreshed);
  return data.streak;
}

/** Call when the user answers a quiz question. The backend only increments once per calendar day. */
export async function recordDailyStreakHit(
  accessToken: string,
  refreshToken: string,
  onTokenRefreshed: (accessToken: string, refreshToken: string, role: string) => void
): Promise<number> {
  const data = await postWithAuth<StreakResponse>("streak/update-streak", accessToken, {}, refreshToken, onTokenRefreshed);
  return data.streak;
}