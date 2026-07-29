export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://newton-theta-bice.vercel.app/api";

// Full-page navigation target for "Continue with Google" — the browser
// goes here directly, it's never called via fetch().
export const GOOGLE_LOGIN_URL = `${API_BASE}/auth/google`;

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  role: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
}

export async function loginRequest(
  userName: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: userName, password }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("მომხმარებლის სახელი ან პაროლი არასწორია");
    }
    throw new Error("შესვლა ვერ მოხერხდა, სცადეთ თავიდან");
  }

  return response.json();
}

export interface RegisterBody {
  userName: string;
  email: string;
  password: string;
}

export async function registerRequest(
  data: RegisterBody
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "რეგისტრაცია ვერ მოხერხდა");
  }

  return response.json();
}

export async function forgotPasswordRequest(
  email: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("მოთხოვნის გაგზავნა ვერ მოხერხდა");
  }

  return response.json();
}

export async function resetPasswordRequest(
  token: string,
  password: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "პაროლის აღდგენა ვერ მოხერხდა");
  }

  return response.json();
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken }),
    });
  } catch {
    // best-effort — local logout still proceeds even if this fails
  }
}

// Shared across all callers so that concurrent requests (e.g. /saved and
// /streak firing around the same time) which each hit a 401/403 don't each
// submit the same refresh token — the backend only allows a refresh token to
// be redeemed once, so a genuine second submission gets a 429 telling the
// loser to retry. Deduping here means only one network call ever goes out;
// everyone else just awaits it.
let refreshInFlight: Promise<RefreshResponse> | null = null;

async function refreshTokens(refreshToken: string): Promise<RefreshResponse> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const response = await fetch(`${API_BASE}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error("სესია ამოიწურა, გთხოვთ თავიდან შეხვიდეთ სისტემაში");
      }

      return response.json();
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

// Sends a resource with an access token using the given HTTP method. If the
// token has expired (401/403), it transparently refreshes once and retries.
async function sendWithAuth<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  endpoint: string,
  accessToken: string,
  body?: unknown,
  refreshToken?: string,
  onTokenRefreshed?: (
    newAccessToken: string,
    newRefreshToken: string,
    role: string
  ) => void
): Promise<T> {
  const send = (token: string) =>
    fetch(`${API_BASE}/${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let response = await send(accessToken);

  if ((response.status === 401 || response.status === 403) && refreshToken) {
    try {
      const tokens = await refreshTokens(refreshToken);
      onTokenRefreshed?.(tokens.accessToken, tokens.refreshToken, tokens.role);
      response = await send(tokens.accessToken);
    } catch {
      throw new Error("სესია ამოიწურა, გთხოვთ თავიდან შეხვიდეთ სისტემაში");
    }
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("სესია ამოიწურა, გთხოვთ თავიდან შეხვიდეთ სისტემაში");
  }

  if (!response.ok) {
    throw new Error("მოქმედება ვერ შესრულდა");
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export function getWithAuth<T>(
  endpoint: string,
  accessToken: string,
  refreshToken?: string,
  onTokenRefreshed?: (
    newAccessToken: string,
    newRefreshToken: string,
    role: string
  ) => void
): Promise<T> {
  return sendWithAuth<T>(
    "GET",
    endpoint,
    accessToken,
    undefined,
    refreshToken,
    onTokenRefreshed
  );
}

export function postWithAuth<T>(
  endpoint: string,
  accessToken: string,
  body: unknown,
  refreshToken?: string,
  onTokenRefreshed?: (
    newAccessToken: string,
    newRefreshToken: string,
    role: string
  ) => void
): Promise<T> {
  return sendWithAuth<T>(
    "POST",
    endpoint,
    accessToken,
    body,
    refreshToken,
    onTokenRefreshed
  );
}

export function patchWithAuth<T>(
  endpoint: string,
  accessToken: string,
  body: unknown,
  refreshToken?: string,
  onTokenRefreshed?: (
    newAccessToken: string,
    newRefreshToken: string,
    role: string
  ) => void
): Promise<T> {
  return sendWithAuth<T>(
    "PATCH",
    endpoint,
    accessToken,
    body,
    refreshToken,
    onTokenRefreshed
  );
}

export function putWithAuth<T>(
  endpoint: string,
  accessToken: string,
  body?: unknown,
  refreshToken?: string,
  onTokenRefreshed?: (
    newAccessToken: string,
    newRefreshToken: string,
    role: string
  ) => void
): Promise<T> {
  return sendWithAuth<T>(
    "PUT",
    endpoint,
    accessToken,
    body,
    refreshToken,
    onTokenRefreshed
  );
}

export function deleteWithAuth<T>(
  endpoint: string,
  accessToken: string,
  refreshToken?: string,
  onTokenRefreshed?: (
    newAccessToken: string,
    newRefreshToken: string,
    role: string
  ) => void
): Promise<T> {
  return sendWithAuth<T>(
    "DELETE",
    endpoint,
    accessToken,
    undefined,
    refreshToken,
    onTokenRefreshed
  );
}

// --- Quiz API Helpers ---

export interface CheckAnswerResponse {
  correct: boolean;
  realAnswer: string;
  explanation: string;
}

// Deliberately does not require auth — quizzes can be taken while logged
// out, and this is the only endpoint allowed to reveal realAnswer.
export async function checkQuizAnswer(
  quizId: string,
  answer: string
): Promise<CheckAnswerResponse> {
  const response = await fetch(`${API_BASE}/quiz/${quizId}/check`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer }),
  });

  if (!response.ok) {
    throw new Error("პასუხის შემოწმება ვერ მოხერხდა");
  }

  return response.json();
}

/**
 * Marks a quiz as completed in the user's MongoDB record using standard auth headers.
 */
export function markQuizDone(
  quizId: string,
  accessToken: string,
  refreshToken?: string,
  onTokenRefreshed?: (
    newAccessToken: string,
    newRefreshToken: string,
    role: string
  ) => void
) {
  return putWithAuth<{ message: string }>(
    `quiz/${quizId}`,
    accessToken,
    undefined,
    refreshToken,
    onTokenRefreshed
  );
}

/**
 * Fetches all completed quizzes for the logged in user.
 */
export function fetchDoneQuizzes(
  accessToken: string,
  refreshToken?: string,
  onTokenRefreshed?: (
    newAccessToken: string,
    newRefreshToken: string,
    role: string
  ) => void
) {
  return getWithAuth<{ _id: string }[]>(
    "quiz/done",
    accessToken,
    refreshToken,
    onTokenRefreshed
  );
}