"use client";

import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { isAdmin } from "../../lib/admin";

type Plan = "trial" | "vip";

const PLANS = {
  trial: { name: "7-day trial", price: 29, period: "7 days" },
  vip: { name: "Monthly VIP", price: 89, period: "month" },
} as const;

export function Pricing() {
  const { user } = useAuth();
  const desk = isAdmin(user?.email);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = desk ? null : plan ? PLANS[plan] : null;

  async function pay() {
    if (!selected || !plan) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email: user.email }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Checkout failed.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="pricing" className="scroll-mt-28 px-6 pb-12">
      <div className="mx-auto max-w-[1240px]">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          Choose your access
        </p>
        {desk ? (
          <p className="mb-5 text-sm text-white/40">
            Preview only — admin does not checkout. Giá và giảm giá chỉnh sau trong Admin.
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <article
            role="button"
            tabIndex={0}
            onClick={() => {
              if (!desk) setPlan("trial");
            }}
            onKeyDown={(e) => {
              if (!desk && (e.key === "Enter" || e.key === " ")) setPlan("trial");
            }}
            className={`overflow-hidden rounded-[28px] bg-[#121212] p-7 text-left ring-1 transition ${
              desk
                ? "ring-white/8"
                : plan === "trial"
                  ? "cursor-pointer ring-[#E2B42A]"
                  : "cursor-pointer ring-white/8 hover:ring-white/16"
            }`}
          >
            <p className="text-sm font-medium text-white/60">7-day trial</p>
            <p className="mt-4 text-[44px] font-semibold tracking-[-0.04em] text-white">
              $29
              <span className="ml-2 text-base font-normal text-white/40">
                / 7 days
              </span>
            </p>
            <ul className="mt-6 space-y-2.5 text-[14px] text-white/55">
              <li>Live XAU/USD signals</li>
              <li>Entry zones · Stop loss · TP1/2/3</li>
              <li>Telegram support</li>
            </ul>
          </article>

          <article
            role="button"
            tabIndex={0}
            onClick={() => {
              if (!desk) setPlan("vip");
            }}
            onKeyDown={(e) => {
              if (!desk && (e.key === "Enter" || e.key === " ")) setPlan("vip");
            }}
            className={`relative overflow-hidden rounded-[28px] bg-[#121212] p-7 text-left ring-1 transition ${
              desk
                ? "ring-white/8"
                : plan === "vip"
                  ? "cursor-pointer ring-[#E2B42A]"
                  : "cursor-pointer ring-white/8 hover:ring-[#E2B42A]/40"
            }`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_100%_100%,rgba(226,180,42,0.28),transparent_60%)]"
            />
            <span className="relative rounded-full bg-[#E2B42A] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1A1408]">
              Most popular
            </span>
            <p className="relative mt-4 text-sm font-medium text-white/60">Monthly VIP</p>
            <p className="relative mt-2 text-[44px] font-semibold tracking-[-0.04em] text-white">
              $89
              <span className="ml-2 text-base font-normal text-white/40">
                / month
              </span>
            </p>
            <ul className="relative mt-6 space-y-2.5 text-[14px] text-white/55">
              <li>Live XAU/USD signals</li>
              <li>Entry · SL · TP1 / TP2 / TP3</li>
              <li>Trading plans + performance tracking</li>
              <li>Telegram support</li>
            </ul>
          </article>
        </div>

        {selected ? (
          <div className="mt-4 overflow-hidden rounded-[28px] bg-[#121212] p-7 ring-1 ring-[#E2B42A]">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E2B42A]">
              Checkout
            </p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-white/50">{selected.name}</p>
                <p className="mt-1 text-4xl font-semibold text-white">
                  ${selected.price}
                  <span className="ml-2 text-base font-normal text-white/40">
                    / {selected.period}
                  </span>
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void pay()}
                className="rounded-full bg-[#E2B42A] px-6 py-3 text-[13px] font-semibold text-[#1A1408] hover:bg-[#F0C54A] disabled:opacity-60"
              >
                {busy ? "Opening Heleket…" : `Pay $${selected.price}`}
              </button>
            </div>
            {error ? <p className="mt-3 text-xs text-[#E35A5A]">{error}</p> : null}
            <p className="mt-3 text-xs text-white/35">
              {user
                ? "Opens Heleket. Pay in USD amount — choose any supported coin on their page."
                : "Sign in first, then pay on Heleket."}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
