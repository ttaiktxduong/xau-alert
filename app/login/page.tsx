"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import { isAdmin } from "../lib/admin";

const field =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#E2B42A]";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    const err = await login(email, String(data.get("password") || ""));
    if (err) {
      setError(err);
      return;
    }
    router.push(isAdmin(email) ? "/admin" : "/");
  }

  return (
    <div className="min-h-full bg-[#050505] text-white">
      <section className="hero-wash px-6 pb-20 pt-[118px] md:pt-[132px]">
        <div className="relative z-10 mx-auto max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Use the account you created on this browser.
          </p>

          {user ? (
            <p className="mt-6 text-sm text-white/50">
              Already in as <span className="font-semibold text-white">{user.name}</span>.
            </p>
          ) : null}

          <form
            onSubmit={onSubmit}
            className="mt-8 rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06] md:p-7"
          >
            <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
              Email
              <input required type="email" name="email" className={field} />
            </label>
            <label className="mt-4 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
              Password
              <input required type="password" name="password" className={field} />
            </label>
            {error ? <p className="mt-3 text-sm text-[#E35A5A]">{error}</p> : null}
            <button
              type="submit"
              className="mt-5 w-full rounded-full bg-[#E2B42A] px-5 py-2.5 text-[13px] font-semibold text-[#1A1408] hover:bg-[#F0C54A]"
            >
              Sign in
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-white/45">
            No account?{" "}
            <Link href="/signup" className="font-semibold text-[#E2B42A] hover:text-white">
              Create account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
