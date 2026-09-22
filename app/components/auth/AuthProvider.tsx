"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import { ADMIN_PASS, isAdmin, lockDesk } from "../../lib/admin";

export type DeskUser = {
  name: string;
  email: string;
};

type StoredUser = DeskUser & { password: string };

type AuthContextValue = {
  user: DeskUser | null;
  ready: boolean;
  login: (email: string, password: string) => string | null;
  signup: (name: string, email: string, password: string) => string | null;
  logout: () => void;
};

const SESSION_KEY = "xau-alert-user";
const USERS_KEY = "xau-alert-users";
const AUTH_EVENT = "xau-auth";
const AuthContext = createContext<AuthContextValue | null>(null);

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as StoredUser[];
  } catch {
    return [];
  }
}

let cachedRaw: string | null | undefined;
let cachedUser: DeskUser | null = null;

function getServerSession(): DeskUser | null {
  return null;
}

function readSession(): DeskUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw === cachedRaw) return cachedUser;
    cachedRaw = raw;
    cachedUser = raw ? (JSON.parse(raw) as DeskUser) : null;
    return cachedUser;
  } catch {
    cachedRaw = null;
    cachedUser = null;
    return null;
  }
}

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function writeSession(next: DeskUser | null) {
  if (next) {
    const raw = JSON.stringify(next);
    localStorage.setItem(SESSION_KEY, raw);
    cachedRaw = raw;
    cachedUser = next;
  } else {
    localStorage.removeItem(SESSION_KEY);
    cachedRaw = null;
    cachedUser = null;
  }
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function subscribeReady() {
  return () => {};
}
function clientReady() {
  return true;
}
function serverReady() {
  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const user = useSyncExternalStore(subscribe, readSession, getServerSession);

  const login = useCallback((email: string, password: string) => {
    if (isAdmin(email) && password === ADMIN_PASS) {
      const found = readUsers().find(
        (item) => item.email.toLowerCase() === email.toLowerCase(),
      );
      writeSession({
        name: found?.name || "Desk",
        email: email.trim(),
      });
      return null;
    }
    const found = readUsers().find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );
    if (!found) return "No account for this email. Create one first.";
    if (found.password !== password) return "Wrong password.";
    writeSession({ name: found.name, email: found.email });
    return null;
  }, []);

  const signup = useCallback((name: string, email: string, password: string) => {
    if (password.length < 6) return "Password must be at least 6 characters.";
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
    writeSession({ name: record.name, email: record.email });
    return null;
  }, []);

  const logout = useCallback(() => {
    lockDesk();
    writeSession(null);
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
  login: () => "Auth is not ready.",
  signup: () => "Auth is not ready.",
  logout: () => {},
};

export function useAuth() {
  return useContext(AuthContext) ?? FALLBACK;
}