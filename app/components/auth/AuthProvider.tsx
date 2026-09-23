"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ADMIN_PASS, isAdmin, lockDesk } from "../../lib/admin";
import { getSupabase, hasSupabase } from "../../lib/supabase";

export type DeskUser = {
  name: string;
  email: string;
};

type StoredUser = DeskUser & { password: string };

type AuthContextValue = {
  user: DeskUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const SESSION_KEY = "xau-alert-user";
const USERS_KEY = "xau-alert-users";
const AuthContext = createContext<AuthContextValue | null>(null);

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as StoredUser[];
  } catch {
    return [];
  }
}

function readLocalSession(): DeskUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as DeskUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const cloud = hasSupabase();
  const [user, setUser] = useState<DeskUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      const local = readLocalSession();
      const timer = window.setTimeout(() => {
        setUser(local);
        setReady(true);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    let alive = true;
    sb.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const session = data.session;
      setUser(
        session?.user.email
          ? {
              email: session.user.email,
              name:
                (session.user.user_metadata?.name as string) ||
                session.user.email.split("@")[0],
            }
          : null,
      );
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user.email
          ? {
              email: session.user.email,
              name:
                (session.user.user_metadata?.name as string) ||
                session.user.email.split("@")[0],
            }
          : null,
      );
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [cloud]);

  const login = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return error.message;
      return null;
    }
    if (isAdmin(email) && password === ADMIN_PASS) {
      const found = readUsers().find(
        (item) => item.email.toLowerCase() === email.toLowerCase(),
      );
      const next = { name: found?.name || "Desk", email: email.trim() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      setUser(next);
      return null;
    }
    const found = readUsers().find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );
    if (!found) return "No account for this email. Create one first.";
    if (found.password !== password) return "Wrong password.";
    const next = { name: found.name, email: found.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setUser(next);
    return null;
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      if (password.length < 6) return "Password must be at least 6 characters.";
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() || email.split("@")[0] } },
        });
        if (error) return error.message;
        return null;
      }
      const users = readUsers();
      if (users.some((item) => item.email.toLowerCase() === email.toLowerCase())) {
        return "Email already registered. Sign in instead.";
      }
      const record: StoredUser = {
        name: name.trim() || email.split("@")[0],
        email,
        password,
      };
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, record]));
      const next = { name: record.name, email: record.email };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      setUser(next);
      return null;
    },
    [],
  );

  const logout = useCallback(async () => {
    lockDesk();
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const FALLBACK: AuthContextValue = {
  user: null,
  ready: true,
  login: async () => "Auth is not ready.",
  signup: async () => "Auth is not ready.",
  logout: async () => {},
};

export function useAuth() {
  return useContext(AuthContext) ?? FALLBACK;
}
