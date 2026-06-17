const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080").replace(/\/$/, "");

const TOKEN_KEY = "studyhub_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401 && typeof window !== "undefined") {
    setToken(null);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || body.title || message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ---- Shared types (mirror backend DTOs) ----
export interface User {
  id: string;
  displayName: string;
  email: string;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  pomodoroWorkMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroRoundsBeforeLongBreak: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type TaskStatus = 0 | 1 | 2; // Todo, Doing, Done

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  subject?: string | null;
  dueDate?: string | null;
  status: TaskStatus;
  position: number;
}

export interface Deck {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  cardCount: number;
  dueCount: number;
}

export interface Card {
  id: string;
  front: string;
  back: string;
  dueAt: string;
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
}

export interface Note {
  id: string;
  parentId?: string | null;
  title: string;
  content: string;
  icon: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  subject: string;
  durationMinutes: number;
  notes?: string | null;
  startedAt: string;
  endedAt: string;
}

export interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string | null;
}

export interface Dashboard {
  user: User;
  totalMinutes: number;
  todayMinutes: number;
  sessionsCount: number;
  dueCards: number;
  openTasks: number;
  timeBySubject: { subject: string; minutes: number }[];
  heatmap: { date: string; minutes: number }[];
}
