"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { lockDesk } from "../../lib/admin";
import { getSupabase } from "../../lib/supabase";

export type DeskUser = {
  name: string;
  email: string;
};

type AuthContextValue = {
  user: DeskUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function fromSession(session: {
  user?: { email?: string | null; user_metadata?: { name?: string } };
} | null): DeskUser | null {
  const email = session?.user?.email;
  if (!email) return null;
  return {
    email,
    name: session?.user?.user_metadata?.name || email.split("@")[0],
  };
}

async function saveProfile(
  id: string,
  email: string,
  name: string,
) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("profiles").upsert({
    id,
    email: email.trim().toLowerCase(),
    name: name.trim() || email.split("@")[0],
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DeskUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      const timer = window.setTimeout(() => setReady(true), 0);
      return () => window.clearTimeout(timer);
    }
    let alive = true;
    sb.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(fromSession(data.session));
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(fromSession(session));
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb) return "Account server is not connected.";
    const { error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return error ? error.message : null;
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      if (password.length < 6) return "Password must be at least 6 characters.";
      const sb = getSupabase();
      if (!sb) return "Account server is not connected.";
      const cleanEmail = email.trim();
      const cleanName = name.trim() || cleanEmail.split("@")[0];
      const { data, error } = await sb.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { name: cleanName } },
      });
      if (error) return error.message;
      if (data.user?.id) {
        await saveProfile(data.user.id, cleanEmail, cleanName);
      }
      return null;
    },
    [],
  );

  const logout = useCallback(async () => {
    lockDesk();
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
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
