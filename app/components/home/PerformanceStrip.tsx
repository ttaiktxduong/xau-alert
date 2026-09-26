"use client";

import Link from "next/link";
import { useState } from "react";
import {
  pipsLabel,
  statsFrom,
  useDesk,
  winrate,
  type Period,
} from "../../lib/desk-store";

const PERIODS = ["Day", "Week", "Month", "Quarter", "Year"] as const;

export function PerformanceStrip() {
  const [period, setPeriod] = useState<Period>("Month");
  const { tickets } = useDesk();
  const s = statsFrom(tickets, period);

  return (
    <section className="px-6 pb-12">
      <div className="mx-auto max-w-[1240px]">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          Live performance · {period.toLowerCase()}
        </p>

        <div className="relative overflow-hidden rounded-[28px] bg-[#121212] p-5 md:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(70%_80%_at_10%_0%,rgba(226,180,42,0.16),transparent_70%)]"
          />

          <div className="relative z-10 grid grid-cols-5 gap-1 rounded-full bg-white/[0.04] p-1">
            {PERIODS.map((item) => {
              const active = item === period;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPeriod(item)}
                  className={`rounded-full py-2.5 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-[#E2B42A] text-[#1A1408]"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              );
            })}
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
            <p className="relative mt-2 text-xs text-white/40">
              Track record. Not a live broker feed.
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

          <div className="relative z-10 mt-5 text-right">
            <Link
              href="/performance"
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E2B42A] hover:text-white"
            >
              Full ledger
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
