// Defaults to the same-origin proxy defined in next.config.ts (see the
// rewrites() comment there for why: it keeps auth cookies first-party).
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

// Routed through the same-origin proxy (see rewrites() in next.config.ts)
// so that when Google redirects back to /api/auth/google/callback, the
// backend's Set-Cookie lands on this frontend's own domain — not on the
// backend's domain, where later same-origin API calls would never see it.
// IMPORTANT: this only works if GOOGLE_CALLBACK_URL (backend env var) and
// the Authorized redirect URI in the Google Cloud Console both point at
// https://<this-frontend-domain>/api/auth/google/callback — not the
// backend's own domain.
export const GOOGLE_LOGIN_URL = `${API_BASE}/auth/google`;

export interface LoginResponse {
  message: string;
  userName: string;
  role: string;
}

interface RefreshResponse {
  userName: string;
  role: string;
}

// Reads the CSRF token the backend hands out (as a non-httpOnly cookie)
// alongside the httpOnly auth cookies.
function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (method !== "GET" && method !== "HEAD") {
    const csrfToken = getCsrfToken();
    if (csrfToken) headers.set("X-CSRF-Token", csrfToken);
  }

  return fetch(`${API_BASE}/${endpoint}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });
}

export async function loginRequest(
  userName: string,
  password: string
): Promise<LoginResponse> {
  const response = await apiFetch("auth/login", {
    method: "POST",
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
  const response = await apiFetch("auth/register", {
    method: "POST",
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
  const response = await apiFetch("auth/forgot-password", {
    method: "POST",
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
  const response = await apiFetch("auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "პაროლის აღდგენა ვერ მოხერხდა");
  }

  return response.json();
}

export async function logoutRequest(): Promise<void> {
  try {
    await apiFetch("auth/logout", { method: "DELETE" });
  } catch {
    // best-effort — local logout still proceeds even if this fails
  }
}

let refreshInFlight: Promise<RefreshResponse> | null = null;

async function refreshSession(): Promise<RefreshResponse> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const response = await apiFetch("auth/token", { method: "POST" });

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

export async function tryRestoreSession(): Promise<RefreshResponse | null> {
  try {
    return await refreshSession();
  } catch {
    return null;
  }
}

async function sendWithAuth<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  endpoint: string,
  body?: unknown
): Promise<T> {
  const send = () =>
    apiFetch(endpoint, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let response = await send();

  if (response.status === 401 || response.status === 403) {
    try {
      await refreshSession();
      response = await send();
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

export function getWithAuth<T>(endpoint: string): Promise<T> {
  return sendWithAuth<T>("GET", endpoint);
}

export function postWithAuth<T>(endpoint: string, body?: unknown): Promise<T> {
  return sendWithAuth<T>("POST", endpoint, body);
}

export function patchWithAuth<T>(endpoint: string, body?: unknown): Promise<T> {
  return sendWithAuth<T>("PATCH", endpoint, body);
}

export function putWithAuth<T>(endpoint: string, body?: unknown): Promise<T> {
  return sendWithAuth<T>("PUT", endpoint, body);
}

export function deleteWithAuth<T>(endpoint: string): Promise<T> {
  return sendWithAuth<T>("DELETE", endpoint);
}

export interface CheckAnswerResponse {
  correct: boolean;
  realAnswer: string;
  explanation: string;
}

export async function checkQuizAnswer(
  quizId: string,
  answer: string
): Promise<CheckAnswerResponse> {
  const response = await apiFetch(`quiz/${quizId}/check`, {
    method: "PUT",
    body: JSON.stringify({ answer }),
  });

  if (!response.ok) {
    throw new Error("პასუხის შემოწმება ვერ მოხერხდა");
  }

  return response.json();
}

export function markQuizDone(quizId: string) {
  return putWithAuth<{ message: string; doneQuizes: string[] }>(
    `quiz/${quizId}/addToDone`
  );
}

export function fetchDoneQuizzes() {
  return getWithAuth<{ _id: string }[]>("quiz/done");
}