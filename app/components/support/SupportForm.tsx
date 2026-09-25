"use client";

import { useState } from "react";
import { getSupabase, hasSupabase } from "../../lib/supabase";

const field =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#E2B42A]";

export function SupportForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setError("");
    if (hasSupabase()) {
      const sb = getSupabase();
      setBusy(true);
      const { error: err } = await sb!.from("messages").insert({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        body: String(data.get("message") || ""),
      });
      setBusy(false);
      if (err) {
        setError(err.message);
        return;
      }
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-[28px] bg-[#121212] p-7 ring-1 ring-white/[0.06]">
        <p className="text-[20px] font-semibold text-white">Message received.</p>
        <p className="mt-2 text-sm leading-6 text-white/50">
          {hasSupabase()
            ? "The desk can read this note in Admin, Support inbox."
            : "Supabase is not connected. This note is not stored on the server."}
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#E2B42A] hover:text-white"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[28px] bg-[#121212] p-7 ring-1 ring-white/[0.06]"
    >
      <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
        Name
        <input required name="name" className={field} />
      </label>
      <label className="mt-4 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
        Email
        <input required type="email" name="email" className={field} />
      </label>
      <label className="mt-4 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
        Message
        <textarea required name="message" rows={5} className={`${field} resize-y`} />
      </label>
      {error ? <p className="mt-3 text-sm text-[#E35A5A]">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="mt-5 rounded-full bg-[#E2B42A] px-5 py-2.5 text-[13px] font-semibold text-[#1A1408] hover:bg-[#F0C54A] disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
