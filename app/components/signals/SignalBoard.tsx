"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useTicketAccess } from "../../lib/access";
import {
  ageLabel,
  ticketTitle,
  useDesk,
  type Ticket,
} from "../../lib/desk-store";

type Filter = "all" | "open" | "closed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
];

function LockRows() {
  return (
    <div className="relative mt-5 space-y-2">
      {["Entry zone", "Stop loss", "TP1", "TP2", "TP3"].map((label) => (
        <div
          key={label}
          className="flex justify-between rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-white/20 blur-[2px]"
        >
          <span className="uppercase tracking-[0.16em]">{label}</span>
          <span>······</span>
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 ring-1 ring-white/10">
          VIP signal
        </span>
      </div>
    </div>
  );
}

function OpenRows({ ticket }: { ticket: Ticket }) {
  const rows = [
    ["Entry zone", ticket.entry],
    ["Stop loss", ticket.sl],
    ["TP1", ticket.tp1],
    ["TP2", ticket.tp2],
    ["TP3", ticket.tp3],
  ];
  return (
    <div className="relative mt-5 space-y-2">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex justify-between rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-white/70"
        >
          <span className="uppercase tracking-[0.16em] text-white/40">{label}</span>
          <span className="font-medium text-white">{value || "—"}</span>
        </div>
      ))}
    </div>
  );
}

export function SignalBoard() {
  const [filter, setFilter] = useState<Filter>("all");
  const { user } = useAuth();
  const { unlocked } = useTicketAccess(user?.email);
  const { tickets } = useDesk();

  const rows = useMemo(() => {
    if (filter === "open") return tickets.filter((t) => t.open);
    if (filter === "closed") return tickets.filter((t) => !t.open);
    return tickets;
  }, [filter, tickets]);

  const live = tickets.filter((t) => t.open).length;
  const closed = tickets.length - live;

  return (
    <div className="bg-[#050505] text-white">
      <section className="hero-wash px-6 pb-20 pt-[118px] md:pt-[132px]">
        <div className="relative z-10 mx-auto max-w-[1240px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E2B42A]" />
                Live gold signals
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
                Signal desk
              </h1>
              <p className="mt-1 text-sm text-white/45">
                {live} open · {closed} closed · desk feed
              </p>
            </div>
            <div className="flex rounded-full bg-white/[0.04] p-1 ring-1 ring-white/8">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition ${
                    filter === item.id
                      ? "bg-[#E2B42A] text-[#1A1408]"
                      : "text-white/45 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {rows.map((t) => {
              return (
                <article
                  key={t.id}
                  className="relative overflow-hidden rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -bottom-16 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(226,180,42,0.16),transparent_68%)]"
                  />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-[12px] text-white/40">
                        GOLD · {ageLabel(t.createdAt)}
                      </p>
                      <p className="mt-2 text-[22px] font-semibold capitalize tracking-[-0.03em] text-white">
                        {ticketTitle(t)}
                      </p>
                      <p className="mt-1 text-xs text-white/40">{t.status}</p>
                    </div>
                    {t.vip ? (
                      <span className="rounded-full border border-[#E2B42A]/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E2B42A]">
                        VIP
                      </span>
                    ) : (
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                          t.status === "Stopped"
                            ? "bg-white/5 text-white/50"
                            : "bg-[#3DCF86]/12 text-[#3DCF86]"
                        }`}
                      >
                        {t.status}
                      </span>
                    )}
                  </div>

                  {t.open ? (
                    unlocked ? (
                      <OpenRows ticket={t} />
                    ) : (
                      <>
                        <LockRows />
                        <Link
                          href="/#pricing"
                          className="relative mt-4 block rounded-full bg-[#E2B42A] px-4 py-2.5 text-center text-[13px] font-semibold text-[#1A1408] hover:bg-[#F0C54A]"
                        >
                          Unlock Entry &amp; SL
                        </Link>
                      </>
                    )
                  ) : (
                    <div className="relative mt-8 flex items-end justify-between">
                      <p className="text-sm text-white/40">Result</p>
                      <p
                        className={`text-2xl font-semibold ${
                          (t.pips ?? 0) >= 0 ? "text-[#E2B42A]" : "text-[#E35A5A]"
                        }`}
                      >
                        {(t.pips ?? 0) >= 0 ? "+" : ""}
                        {t.pips} pips
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
