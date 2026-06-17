"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, setToken, getToken, AuthResponse, User } from "./api";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (u: User) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<User>("/api/auth/me")
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<AuthResponse>("/api/auth/login", { email, password });
    setToken(res.token);
    setUser(res.user);
    router.push("/dashboard");
  }

  async function register(displayName: string, email: string, password: string) {
    const res = await api.post<AuthResponse>("/api/auth/register", {
      DisplayName: displayName,
      email,
      password,
    });
    setToken(res.token);
    setUser(res.user);
    router.push("/dashboard");
  }

  function logout() {
    setToken(null);
    setUser(null);
    router.push("/");
  }

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
