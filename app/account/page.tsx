"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import { isAdmin } from "../lib/admin";

export default function AccountPage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="bg-[#050505] px-6 pb-20 pt-[118px] text-center text-sm text-white/40">
        Loading…
      </div>
    );
  }

  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-full bg-[#050505] text-white">
      <section className="hero-wash px-6 pb-24 pt-[118px] md:pt-[132px]">
        <div className="relative z-10 mx-auto max-w-[560px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
            Profile
          </h1>

          <div className="relative mt-8 overflow-hidden rounded-[28px] bg-[#121212] p-7 ring-1 ring-white/[0.06]">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -bottom-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(226,180,42,0.22),transparent_68%)]"
            />
            <div className="relative flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#E2B42A] text-xl font-bold text-[#1A1408]">
                {initial}
              </span>
              <div>
                <p className="text-[22px] font-semibold tracking-[-0.03em] text-white">
                  {user.name}
                </p>
                <p className="mt-1 text-sm text-white/50">{user.email}</p>
              </div>
            </div>
            <p className="relative mt-5 text-xs text-white/35">
              Demo session in this browser only.
            </p>
          </div>

          <div className={`mt-4 grid gap-3 ${isAdmin(user.email) ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            <Link
              href="/signals"
              className="rounded-[22px] bg-[#121212] px-5 py-4 text-sm text-white/70 ring-1 ring-white/[0.06] transition hover:text-white"
            >
              Live signals
            </Link>
            {isAdmin(user.email) ? (
              <Link
                href="/admin"
                className="rounded-[22px] bg-[#121212] px-5 py-4 text-sm text-white/70 ring-1 ring-white/[0.06] transition hover:text-white"
              >
                Admin desk
              </Link>
            ) : null}
            <Link
              href="/#pricing"
              className="rounded-[22px] bg-[#121212] px-5 py-4 text-sm text-white/70 ring-1 ring-white/[0.06] transition hover:text-white"
            >
              Unlock VIP
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="mt-8 rounded-full border border-white/15 px-5 py-2.5 text-[13px] font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}
