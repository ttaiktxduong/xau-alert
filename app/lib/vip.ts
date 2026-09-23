"use client";

import { useSyncExternalStore } from "react";

export type VipPlan = "trial" | "vip";

export type VipState = {
  plan: VipPlan;
  expiresAt: number;
};

const PREFIX = "xau-vip-v1:";
const LEGACY = "xau-vip-v1";
const EVENT = "xau-vip";

const LIFE_MS: Record<VipPlan, number> = {
  trial: 7 * 24 * 60 * 60 * 1000,
  vip: 30 * 24 * 60 * 60 * 1000,
};

const cache = new Map<string, VipState | null>();

function slot(email?: string | null) {
  return email ? `${PREFIX}${email.trim().toLowerCase()}` : "";
}

function parse(raw: string | null): VipState | null {
  if (!raw) return null;
  if (raw === "trial" || raw === "vip" || raw === "1") {
    const plan: VipPlan = raw === "trial" ? "trial" : "vip";
    return { plan, expiresAt: Date.now() + LIFE_MS[plan] };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<VipState>;
    if (parsed.plan !== "trial" && parsed.plan !== "vip") return null;
    if (typeof parsed.expiresAt !== "number") return null;
    return { plan: parsed.plan, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

function readEmail(email?: string | null): VipState | null {
  const key = slot(email);
  if (!key) return null;
  if (cache.has(key)) return cache.get(key) ?? null;
  try {
    const state = parse(localStorage.getItem(key));
    cache.set(key, state);
    return state;
  } catch {
    cache.set(key, null);
    return null;
  }
}

function writeEmail(email: string, state: VipState | null) {
  const key = slot(email);
  if (!key) return;
  try {
    if (!state) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  cache.set(key, state);
  window.dispatchEvent(new Event(EVENT));
}

export function grantVip(plan: VipPlan = "vip", email?: string | null) {
  if (!email) return;
  const current = readEmail(email);
  const start =
    current && current.plan === plan && current.expiresAt > Date.now()
      ? current.expiresAt
      : Date.now();
  writeEmail(email, { plan, expiresAt: start + LIFE_MS[plan] });
}

export function revokeVip(email?: string | null) {
  if (!email) return;
  writeEmail(email, null);
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useVipState(email?: string | null) {
  return useSyncExternalStore(
    subscribe,
    () => readEmail(email),
    () => null,
  );
}

export function useVipPlan(email?: string | null) {
  return useVipState(email)?.plan ?? null;
}

export function useVip(email?: string | null) {
  return useVipState(email) !== null;
}

export function daysLeft(expiresAt: number, now: number) {
  const ms = expiresAt - now;
  if (ms <= 0) return 0;
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export function clearLegacyVip() {
  try {
    localStorage.removeItem(LEGACY);
  } catch {
    /* ignore */
  }
}
