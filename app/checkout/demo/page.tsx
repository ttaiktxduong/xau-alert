"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import { grantVip } from "../../lib/vip";

function DemoInner() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useSearchParams();
  const plan = params.get("plan") === "trial" ? "7-day trial" : "Monthly VIP";
  const amount = params.get("amount") || "0";
  const order = params.get("order") || "—";

  return (
    <div className="min-h-full bg-[#050505] text-white">
      <section className="hero-wash px-6 pb-20 pt-[118px] md:pt-[132px]">
        <div className="relative z-10 mx-auto max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Heleket demo
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
            Test checkout
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/50">
            Merchant ID and payment key are missing, so this is a demo page.
            Live checkout opens pay.heleket.com so the client can pick a coin.
          </p>
          <div className="mt-8 rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06]">
            <p className="text-sm text-white/45">{plan}</p>
            <p className="mt-1 text-4xl font-semibold">${amount}</p>
            <p className="mt-2 text-xs text-white/30">Order {order}</p>
            <p className="mt-6 text-sm text-white/50">
              USD invoice → khách chọn BTC / USDT / ETH trên Heleket.
            </p>
            <div className="mt-5 rounded-2xl bg-white/[0.04] px-4 py-3 text-[12px] leading-5 text-white/45">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#E2B42A]">
                Disclaimer
              </p>
              <p className="mt-1.5">
                Access is visibility of tickets, not financial advice and not a
                managed account. Past pips do not predict results. You place
                every order yourself.
              </p>
              <Link href="/legal" className="mt-2 inline-block text-[#E2B42A] hover:text-white">
                Full disclaimer
              </Link>
            </div>
            <button
              type="button"
              onClick={() => {
                grantVip(
                  params.get("plan") === "trial" ? "trial" : "vip",
                  user?.email,
                );
                router.push("/signals");
              }}
              className="mt-6 block w-full rounded-full bg-[#E2B42A] px-5 py-2.5 text-center text-[13px] font-semibold text-[#1A1408]"
            >
              Fake paid (demo only)
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

export default function CheckoutDemoPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#050505] px-6 pb-20 pt-[118px] text-sm text-white/40">
          Loading…
        </div>
      }
    >
      <DemoInner />
    </Suspense>
  );
}