"use client";

import Link from "next/link";
import { useAuth } from "../auth/AuthProvider";
import { isAdmin } from "../../lib/admin";
import { useVip } from "../../lib/vip";
import {
  ageLabel,
  ticketTitle,
  useDesk,
  type Ticket,
} from "../../lib/desk-store";

function scrollToPricing() {
  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function BrandMark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex h-[48%] items-end justify-center pb-8"
    >
      <img
        src="/logo-xau.jpg"
        alt=""
        className="h-full w-auto max-w-[280px] object-contain opacity-[0.22] [mask-image:radial-gradient(circle,black_40%,transparent_78%)]"
      />
    </div>
  );
}

function LockRows() {
  return (
    <div className="relative mt-5 space-y-2">
      {["Entry zone", "Stop loss"].map((label) => (
        <div
          key={label}
          className="flex justify-between rounded-xl bg-white/[0.04] px-3 py-2.5 text-xs text-white/20 blur-[2px]"
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

function OpenRows({ ticket }: { ticket?: Ticket }) {
  const rows = [
    ["Entry zone", ticket?.entry],
    ["Stop loss", ticket?.sl],
    ["TP1", ticket?.tp1],
    ["TP2", ticket?.tp2],
    ["TP3", ticket?.tp3],
  ];
  return (
    <div className="mt-5 space-y-2">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex justify-between rounded-xl bg-white/[0.04] px-3 py-2.5 text-xs text-white/70"
        >
          <span className="uppercase tracking-[0.16em] text-white/40">{label}</span>
          <span className="font-medium text-white">{value || "—"}</span>
        </div>
      ))}
    </div>
  );
}

export function LatestTicket() {
  const { user } = useAuth();
  const vip = useVip(user?.email);
  const unlocked = isAdmin(user?.email) || vip;
  const { tickets } = useDesk();
  const open = tickets.filter((t) => t.open);
  const featured = open[0];
  const second = open[1];
  const closed = tickets.find((t) => !t.open);

  return (
    <section className="bg-[#050505] px-6 pb-12 pt-6">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-5 flex items-center justify-between">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E2B42A]" />
            Live XAU/USD signals
          </p>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/30">
            Desk feed
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article
            role="link"
            tabIndex={0}
            onClick={scrollToPricing}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") scrollToPricing();
            }}
            className="relative min-h-[420px] cursor-pointer overflow-hidden rounded-[28px] bg-[#121212] p-7 lg:row-span-2"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_100%,rgba(226,180,42,0.55),rgba(226,180,42,0.08)_42%,transparent_70%)]"
            />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[13px] text-white/45">
                  {featured?.pair ?? "XAU/USD"} ·{" "}
                  {featured ? ageLabel(featured.createdAt) : "—"}
                </p>
                <h3 className="mt-3 max-w-xs text-[32px] font-semibold capitalize leading-tight tracking-[-0.03em] text-white">
                  {featured ? ticketTitle(featured) : "No open plan"}
                </h3>
                <p className="mt-3 max-w-sm text-[14px] leading-6 text-white/50">
                  {featured?.status ?? "Publish a ticket in Admin to show it here."}
                </p>
              </div>
              <span className="rounded-full border border-[#E2B42A]/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E2B42A]">
                VIP
              </span>
            </div>

            <div className="relative z-10 mt-6 max-w-sm">
              {unlocked ? <OpenRows ticket={featured} /> : <LockRows />}
            </div>

            <BrandMark />

            <span
              className="absolute bottom-6 right-6 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-[#1A1408] transition hover:bg-white"
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path
                  d="M7 17 17 7M9 7h8v8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </article>

          <article
            role="link"
            tabIndex={0}
            onClick={scrollToPricing}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") scrollToPricing();
            }}
            className="relative cursor-pointer overflow-hidden rounded-[28px] bg-[#121212] p-7"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(80%_80%_at_80%_80%,rgba(226,180,42,0.22),transparent_70%)]"
            />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[13px] text-white/45">
                  {second?.pair ?? "XAU/USD"} ·{" "}
                  {second ? ageLabel(second.createdAt) : "—"}
                </p>
                <h3 className="mt-3 text-[28px] font-semibold capitalize tracking-[-0.03em] text-white">
                  {second ? ticketTitle(second) : "Waiting next plan"}
                </h3>
                <p className="mt-2 max-w-md text-[14px] leading-6 text-white/50">
                  {second?.status ?? "The next open ticket will land in this card."}
                </p>
              </div>
              <span className="rounded-full border border-[#E2B42A]/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E2B42A]">
                VIP
              </span>
            </div>
            <div className="relative z-10 max-w-md">
              {unlocked ? <OpenRows ticket={second} /> : <LockRows />}
            </div>
            {unlocked ? null : (
              <span className="relative z-10 mt-5 inline-flex h-11 items-center rounded-full bg-[#E2B42A] px-5 text-[13px] font-medium text-[#1A1408]">
                Unlock Entry &amp; SL
              </span>
            )}
          </article>

          <Link
            href="/performance"
            className="relative overflow-hidden rounded-[28px] bg-[#121212] p-7"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -bottom-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(226,180,42,0.28),transparent_68%)]"
            />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[13px] text-white/45">
                  {closed?.pair ?? "XAU/USD"} · closed
                </p>
                <h3 className="mt-3 text-[28px] font-semibold capitalize tracking-[-0.03em] text-white">
                  {closed ? ticketTitle(closed) : "No close yet"}
                </h3>
              </div>
              <span className="rounded-full bg-[#3DCF86]/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#3DCF86]">
                {closed?.result ?? "—"}
              </span>
            </div>
            <p className="relative z-10 mt-4 max-w-md text-[14px] leading-6 text-white/50">
              Closed plan shown as social proof of execution — mock data, not a
              live guarantee.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
