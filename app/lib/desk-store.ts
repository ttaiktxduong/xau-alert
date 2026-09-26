"use client";

import { useMemo, useSyncExternalStore } from "react";

export type Side = "buy" | "sell";
export type Setup = "limit" | "market";
export type Result = "Hit TP1" | "Hit TP2" | "Hit TP3" | "Stopped" | "Canceled";
export type Period = "Day" | "Week" | "Month" | "Quarter" | "Year";

export function pairLabel(_pair?: string) {
  return "GOLD";
}

export type Ticket = {
  id: string;
  pair: "XAU/USD";
  side: Side;
  setup: Setup;
  open: boolean;
  status: string;
  vip: boolean;
  createdAt: number;
  closedAt?: number;
  entry?: string;
  sl?: string;
  tp1?: string;
  tp2?: string;
  tp3?: string;
  pips?: number;
  result?: Result;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: number;
  unread: boolean;
};

export type DeskState = {
  tickets: Ticket[];
  notes: Note[];
};

export type DeskStats = {
  pips: number;
  wins: number;
  losses: number;
  plans: number;
  triggered: number;
  canceled: number;
  tp1: number;
  tp2: number;
  tp3: number;
};

const KEY = "xau-desk-v1";
const EVENT = "xau-desk";

const now = Date.now();
const m = 60_000;
const h = 60 * m;
const d = 24 * h;

const SEED_TICKETS: Ticket[] = [
  {
    id: "t1",
    pair: "XAU/USD",
    side: "sell",
    setup: "limit",
    open: true,
    status: "New plan",
    vip: true,
    createdAt: now - 5 * m,
    entry: "2648–2652",
    sl: "2661",
    tp1: "2638",
    tp2: "2629",
    tp3: "2618",
  },
  {
    id: "t2",
    pair: "XAU/USD",
    side: "buy",
    setup: "limit",
    open: true,
    status: "New plan",
    vip: true,
    createdAt: now - 12 * m,
    entry: "2632–2636",
    sl: "2624",
    tp1: "2646",
    tp2: "2655",
    tp3: "2668",
  },
  {
    id: "t3",
    pair: "XAU/USD",
    side: "buy",
    setup: "market",
    open: true,
    status: "Running",
    vip: true,
    createdAt: now - 41 * m,
    entry: "2641",
    sl: "2633",
    tp1: "2652",
    tp2: "2660",
    tp3: "2672",
  },
  {
    id: "t4",
    pair: "XAU/USD",
    side: "sell",
    setup: "limit",
    open: true,
    status: "Waiting zone",
    vip: true,
    createdAt: now - 1 * h,
    entry: "2656–2660",
    sl: "2668",
    tp1: "2644",
    tp2: "2634",
    tp3: "2622",
  },
  {
    id: "t5",
    pair: "XAU/USD",
    side: "sell",
    setup: "market",
    open: false,
    status: "Hit TP1",
    vip: false,
    createdAt: now - 3 * h,
    closedAt: now - 2 * h,
    pips: 42,
    result: "Hit TP1",
  },
  {
    id: "t6",
    pair: "XAU/USD",
    side: "buy",
    setup: "limit",
    open: false,
    status: "Hit TP2",
    vip: false,
    createdAt: now - 2 * d,
    closedAt: now - 1 * d,
    pips: 86,
    result: "Hit TP2",
  },
  {
    id: "t7",
    pair: "XAU/USD",
    side: "sell",
    setup: "limit",
    open: false,
    status: "Stopped",
    vip: false,
    createdAt: now - 3 * d,
    closedAt: now - 2 * d,
    pips: -18,
    result: "Stopped",
  },
  {
    id: "t8",
    pair: "XAU/USD",
    side: "buy",
    setup: "market",
    open: false,
    status: "Hit TP1",
    vip: false,
    createdAt: now - 4 * d,
    closedAt: now - 3 * d,
    pips: 31,
    result: "Hit TP1",
  },
];

const SEED_NOTES: Note[] = [
  {
    id: "n1",
    title: "New SELL LIMIT",
    body: "Gold plan published. Entry and SL locked for VIP.",
    href: "/signals",
    createdAt: now - 5 * m,
    unread: true,
  },
  {
    id: "n2",
    title: "New BUY LIMIT",
    body: "Gold plan published. Unlock to read the zone.",
    href: "/signals",
    createdAt: now - 12 * m,
    unread: true,
  },
  {
    id: "n3",
    title: "SELL hit TP1",
    body: "Closed ticket added to the ledger as social proof.",
    href: "/performance",
    createdAt: now - 2 * h,
    unread: true,
  },
];

const SEED: DeskState = { tickets: SEED_TICKETS, notes: SEED_NOTES };

let cacheRaw = "";
let cache: DeskState = SEED;

function seed(): DeskState {
  return {
    tickets: SEED_TICKETS.map((t) => ({ ...t })),
    notes: SEED_NOTES.map((n) => ({ ...n })),
  };
}

function read(): DeskState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const next = seed();
      localStorage.setItem(KEY, JSON.stringify(next));
      cacheRaw = JSON.stringify(next);
      cache = next;
      return next;
    }
    if (raw === cacheRaw) return cache;
    cacheRaw = raw;
    cache = JSON.parse(raw) as DeskState;
    if (!Array.isArray(cache.tickets) || !Array.isArray(cache.notes)) {
      cache = seed();
    }
    return cache;
  } catch {
    cache = seed();
    return cache;
  }
}

const EMPTY: DeskState = { tickets: [], notes: [] };
function empty(): DeskState {
  return EMPTY;
}

function write(next: DeskState) {
  cache = next;
  cacheRaw = JSON.stringify(next);
  localStorage.setItem(KEY, cacheRaw);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  const handler = () => onChange();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function ageLabel(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  if (diff < h) {
    const mins = Math.max(1, Math.round(diff / m));
    return `${mins} min ago`;
  }
  if (diff < d) {
    const hours = Math.round(diff / h);
    return `${hours} hr ago`;
  }
  const days = Math.round(diff / d);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function ticketTitle(t: Ticket) {
  return t.open ? `${t.side} ${t.setup}` : t.side;
}

export function periodMs(period: Period) {
  if (period === "Day") return d;
  if (period === "Week") return 7 * d;
  if (period === "Month") return 30 * d;
  if (period === "Quarter") return 90 * d;
  return 365 * d;
}

export function statsFrom(tickets: Ticket[], period: Period): DeskStats {
  const from = Date.now() - periodMs(period);
  const inWindow = tickets.filter((t) => (t.closedAt ?? t.createdAt) >= from);
  const closed = inWindow.filter((t) => !t.open);
  const wins = closed.filter((t) => (t.pips ?? 0) > 0);
  const losses = closed.filter((t) => (t.pips ?? 0) < 0);
  return {
    pips: closed.reduce((sum, t) => sum + (t.pips ?? 0), 0),
    wins: wins.length,
    losses: losses.length,
    plans: inWindow.length,
    triggered: closed.filter((t) => t.result && t.result !== "Canceled").length,
    canceled: closed.filter((t) => t.result === "Canceled").length,
    tp1: closed.filter((t) => t.result === "Hit TP1").length,
    tp2: closed.filter((t) => t.result === "Hit TP2").length,
    tp3: closed.filter((t) => t.result === "Hit TP3").length,
  };
}

export function pipsLabel(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} pips`;
}

export function winrate(s: DeskStats) {
  const total = s.wins + s.losses;
  if (!total) return "0.0%";
  return `${((s.wins / total) * 100).toFixed(1)}%`;
}

type NewTicket = {
  side: Side;
  setup: Setup;
  status: string;
  vip: boolean;
  entry?: string;
  sl?: string;
  tp1?: string;
  tp2?: string;
  tp3?: string;
};

export function addTicket(input: NewTicket) {
  const state = read();
  const ticket: Ticket = {
    id: uid("t"),
    pair: "XAU/USD",
    open: true,
    createdAt: Date.now(),
    ...input,
  };
  const note: Note = {
    id: uid("n"),
    title: `New ${ticket.side.toUpperCase()} ${ticket.setup.toUpperCase()}`,
    body: "Gold plan published. Entry and SL locked for VIP.",
    href: "/signals",
    createdAt: ticket.createdAt,
    unread: true,
  };
  write({
    tickets: [ticket, ...state.tickets],
    notes: [note, ...state.notes],
  });
  return ticket;
}

export function updateTicket(id: string, patch: Partial<Ticket>) {
  const state = read();
  write({
    ...state,
    tickets: state.tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  });
}

export function closeTicket(id: string, result: Result, pips: number) {
  const state = read();
  const current = state.tickets.find((t) => t.id === id);
  if (!current) return;
  const closedAt = Date.now();
  const ticket: Ticket = {
    ...current,
    open: false,
    vip: false,
    status: result,
    result,
    pips,
    closedAt,
  };
  const note: Note = {
    id: uid("n"),
    title: `${current.side.toUpperCase()} ${result.toLowerCase()}`,
    body:
      result === "Stopped" || result === "Canceled"
        ? "Closed ticket recorded on the ledger."
        : "Closed ticket added to the ledger as social proof.",
    href: "/performance",
    createdAt: closedAt,
    unread: true,
  };
  write({
    tickets: state.tickets.map((t) => (t.id === id ? ticket : t)),
    notes: [note, ...state.notes],
  });
}

export function removeTicket(id: string) {
  const state = read();
  write({
    tickets: state.tickets.filter((t) => t.id !== id),
    notes: state.notes,
  });
}

export function markNoteRead(id: string) {
  const state = read();
  write({
    ...state,
    notes: state.notes.map((n) => (n.id === id ? { ...n, unread: false } : n)),
  });
}

export function markAllNotesRead() {
  const state = read();
  write({
    ...state,
    notes: state.notes.map((n) => ({ ...n, unread: false })),
  });
}

export function resetDesk() {
  write(seed());
}

export function useDesk() {
  const state = useSyncExternalStore(subscribe, read, empty);
  return useMemo(
    () => ({
      tickets: [...state.tickets].sort((a, b) => b.createdAt - a.createdAt),
      notes: [...state.notes].sort((a, b) => b.createdAt - a.createdAt),
    }),
    [state],
  );
}
