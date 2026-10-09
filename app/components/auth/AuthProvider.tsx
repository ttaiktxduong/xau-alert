"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { isAdmin } from "../../lib/admin";
import { getSupabase } from "../../lib/supabase";

export type Role = "guest" | "user" | "vip" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  vip_plan: string | null;
  vip_expires_at: string | null;
  isVip: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, pass: string) => Promise<string | null>;
  signup: (name: string, email: string, pass: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function checkIsVip(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  const time = new Date(expiresAt).getTime();
  return !isNaN(time) && time > Date.now();
}

async function fetchFullProfile(userId: string, email: string, name: string): Promise<AuthUser> {
  const sb = getSupabase();
  const cleanEmail = email.trim().toLowerCase();
  const isSuperAdmin = isAdmin(cleanEmail);

  if (!sb) {
    return {
      id: userId,
      email: cleanEmail,
      name,
      role: isSuperAdmin ? "admin" : "user",
      vip_plan: null,
      vip_expires_at: null,
      isVip: false,
    };
  }

  const { data } = await sb
    .from("profiles")
    .select("role, vip_plan, vip_expires_at")
    .eq("id", userId)
    .single();

  const isVip = checkIsVip(data?.vip_expires_at);

  let role: Role = "user";
  if (isSuperAdmin || data?.role === "admin") {
    role = "admin";
  } else if (isVip) {
    role = "vip";
  }

  return {
    id: userId,
    email: cleanEmail,
    name,
    role,
    vip_plan: data?.vip_plan || null,
    vip_expires_at: data?.vip_expires_at || null,
    isVip,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const syncUser = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }

    try {
      const { data } = await sb.auth.getSession();
      const session = data?.session;
      if (!session?.user?.email) {
        setUser(null);
      } else {
        const email = session.user.email;
        const name = session.user.user_metadata?.name || email.split("@")[0];
        const fullUser = await fetchFullProfile(session.user.id, email, name);
        setUser(fullUser);
      }
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    syncUser();

    const sb = getSupabase();
    if (!sb) return;

    const { data: sub } = sb.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user?.email) {
        setUser(null);
      } else {
        const email = session.user.email;
        const name = session.user.user_metadata?.name || email.split("@")[0];
        const fullUser = await fetchFullProfile(session.user.id, email, name);
        setUser(fullUser);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [syncUser]);

  const login = useCallback(async (email: string, pass: string) => {
    const sb = getSupabase();
    if (!sb) return "Chưa kết nối máy chủ tài khoản.";
    const { error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });
    return error ? error.message : null;
  }, []);

  const signup = useCallback(async (name: string, email: string, pass: string) => {
    if (pass.length < 6) return "Mật khẩu tối thiểu 6 ký tự.";
    const sb = getSupabase();
    if (!sb) return "Chưa kết nối máy chủ tài khoản.";

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split("@")[0];

    const { data, error } = await sb.auth.signUp({
      email: cleanEmail,
      password: pass,
      options: {
        data: { name: cleanName },
      },
    });

    if (error) return error.message;

    if (data.user?.id) {
      await sb.from("profiles").upsert({
        id: data.user.id,
        email: cleanEmail,
        name: cleanName,
        role: isAdmin(cleanEmail) ? "admin" : "user",
      });
    }

    return null;
  }, []);

  const logout = useCallback(async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        login,
        signup,
        logout,
        refreshUser: syncUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
