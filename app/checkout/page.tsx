"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import { CHECKOUT_PLANS, type CheckoutPlan } from "../lib/heleket";

function CheckoutInner() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const params = useSearchParams();
  const raw = params.get("plan");
  const plan: CheckoutPlan = raw === "trial" ? "trial" : "vip";
  const selected = CHECKOUT_PLANS[plan];
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    if (!accepted) {
      setError("Accept the disclaimer to continue.");
      return;
    }
    if (!user) {
      router.push("/login");
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
        setError(data.error || "Checkout is not ready.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="bg-[#050505] px-6 pb-20 pt-[118px] text-sm text-white/40">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#050505] text-white">
      <section className="hero-wash px-6 pb-20 pt-[118px] md:pt-[132px]">
        <div className="relative z-10 mx-auto max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
            Pay with crypto
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/50">
            USD invoice on Heleket. Choose BTC, USDT, ETH or another supported
            coin on the next page.
          </p>
          <div className="mt-8 rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06]">
            <p className="text-sm text-white/45">{selected.name}</p>
            <p className="mt-1 text-4xl font-semibold">${selected.amount}</p>
            <p className="mt-1 text-sm text-white/35">{selected.period}</p>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-white/[0.04] px-4 py-3">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => {
                  setAccepted(e.target.checked);
                  setError("");
                }}
                className="mt-1 h-4 w-4 shrink-0 accent-[#E2B42A]"
              />
              <span className="text-[12px] leading-5 text-white/55">
                I understand this buys visibility of tickets only. It is not
                financial advice and not a managed account. I place every order
                myself.{" "}
                <Link href="/legal" className="text-[#E2B42A] hover:text-white">
                  Full disclaimer
                </Link>
              </span>
            </label>

            {error ? (
              <p className="mt-4 text-sm text-[#E35A5A]">{error}</p>
            ) : null}

            <button
              type="button"
              disabled={!accepted || busy}
              onClick={() => void pay()}
              className="mt-6 block w-full rounded-full bg-[#E2B42A] px-5 py-2.5 text-center text-[13px] font-semibold text-[#1A1408] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Opening Heleket…" : `Pay $${selected.amount}`}
            </button>
            <Link
              href="/#pricing"
              className="mt-3 block text-center text-[13px] text-white/40 hover:text-white"
            >
              Cancel
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#050505] px-6 pb-20 pt-[118px] text-sm text-white/40">
          Loading…
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
