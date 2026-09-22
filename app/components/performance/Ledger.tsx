"use client";

import { useState } from "react";
import {
  ageLabel,
  pipsLabel,
  statsFrom,
  useDesk,
  winrate,
  type Period,
} from "../../lib/desk-store";

const PERIODS = ["Day", "Week", "Month", "Quarter", "Year"] as const;

export function Ledger() {
  const [period, setPeriod] = useState<Period>("Month");
  const { tickets } = useDesk();
  const s = statsFrom(tickets, period);
  const closed = tickets.filter((t) => !t.open);

  return (
    <div className="bg-[#050505] text-white">
      <section className="hero-wash px-6 pb-20 pt-[118px] md:pt-[132px]">
        <div className="relative z-10 mx-auto max-w-[1240px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Live performance · {period.toLowerCase()}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
            Ledger
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Built from closed tickets in this browser desk.
          </p>

          <div className="relative mt-8 overflow-hidden rounded-[28px] bg-[#121212] p-5 ring-1 ring-white/[0.06] md:p-7">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(70%_80%_at_10%_0%,rgba(226,180,42,0.16),transparent_70%)]"
            />

            <div className="relative z-10 grid grid-cols-5 gap-1 rounded-full bg-white/[0.04] p-1">
              {PERIODS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPeriod(item)}
                  className={`rounded-full py-2.5 text-[13px] font-medium transition ${
                    item === period
                      ? "bg-[#E2B42A] text-[#1A1408]"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="relative z-10 mt-5 overflow-hidden rounded-[22px] bg-white/[0.03] px-5 py-6">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_0%_50%,rgba(226,180,42,0.18),transparent_60%)]"
              />
              <p className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-[#E2B42A]">
                Net profit
              </p>
              <p className="relative mt-1 text-3xl font-semibold tracking-tight text-[#E2B42A] md:text-5xl">
                {pipsLabel(s.pips)}
              </p>
            </div>

            <div className="relative z-10 mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-[20px] bg-white/[0.04] px-5 py-5">
                <p className="text-2xl font-semibold text-white">{s.wins}</p>
                <p className="mt-1 text-[13px] text-white/40">Win trades</p>
              </div>
              <div className="rounded-[20px] bg-white/[0.04] px-5 py-5">
                <p className="text-2xl font-semibold text-white">{winrate(s)}</p>
                <p className="mt-1 text-[13px] text-white/40">Winrate</p>
              </div>
              <div className="rounded-[20px] bg-white/[0.04] px-5 py-5">
                <p className="text-2xl font-semibold text-white">{s.losses}</p>
                <p className="mt-1 text-[13px] text-white/40">Loss trades</p>
              </div>
            </div>

            <div className="relative z-10 mt-3 grid gap-2 md:grid-cols-3">
              {[
                ["Total plans", s.plans],
                ["Triggered", s.triggered],
                ["Canceled / missed", s.canceled],
                ["TP1 hit", s.tp1],
                ["TP2 hit", s.tp2],
                ["TP3 hit", s.tp3],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between rounded-[18px] bg-white/[0.04] px-4 py-3 text-sm"
                >
                  <span className="text-white/40">{label}</span>
                  <span className="font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
              Closed tickets
            </p>
            <div className="overflow-hidden rounded-[28px] bg-[#121212] ring-1 ring-white/[0.06]">
              <div className="grid grid-cols-[1.4fr_0.6fr_0.8fr_0.6fr] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">
                <span>When</span>
                <span>Side</span>
                <span>Result</span>
                <span className="text-right">Pips</span>
              </div>
              {closed.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1.4fr_0.6fr_0.8fr_0.6fr] border-t border-white/[0.06] px-5 py-3.5 text-sm"
                >
                  <span className="text-white/50">{ageLabel(row.closedAt ?? row.createdAt)}</span>
                  <span className="font-semibold uppercase text-white">{row.side}</span>
                  <span className="text-white/50">{row.result ?? row.status}</span>
                  <span
                    className={`text-right font-semibold ${
                      (row.pips ?? 0) >= 0 ? "text-[#E2B42A]" : "text-[#E35A5A]"
                    }`}
                  >
                    {(row.pips ?? 0) >= 0 ? "+" : ""}
                    {row.pips ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
