"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, hasSupabase } from "../../lib/supabase";

type Row = {
  id: string;
  name: string;
  email: string;
  body: string;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
};

export function Inbox() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!hasSupabase()) return;
    const sb = getSupabase();
    if (!sb) return;
    sb.from("messages")
      .select("id,name,email,body,reply,replied_at,created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setRows((data as Row[]) || []);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveReply(id: string) {
    const text = (drafts[id] || "").trim();
    if (!text) return;
    const sb = getSupabase();
    if (!sb) return;
    setBusy(id);
    setError("");
    const { error: err } = await sb
      .from("messages")
      .update({ reply: text, replied_at: new Date().toISOString() })
      .eq("id", id);
    setBusy(null);
    if (err) {
      setError(err.message);
      return;
    }
    setDrafts((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });
    load();
  }

  if (!hasSupabase()) {
    return (
      <p className="mt-6 text-sm text-white/35">
        Supabase is not connected. Support mail appears here after you add the URL and anon key.
      </p>
    );
  }

  return (
    <div className="mt-8 rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E2B42A]">
        Support inbox
      </p>
      <p className="mt-2 text-sm text-white/40">
        Reply here. The member sees it on Support when signed in.
      </p>
      {error ? <p className="mt-3 text-sm text-[#E35A5A]">{error}</p> : null}
      {rows.length === 0 && !error ? (
        <p className="mt-3 text-sm text-white/40">No messages yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {rows.map((row) => (
            <li key={row.id} className="rounded-2xl bg-white/[0.03] p-4">
              <p className="text-sm text-white">
                {row.name}{" "}
                <span className="text-white/40">{row.email}</span>
              </p>
              <p className="mt-1 text-xs text-white/30">
                {new Date(row.created_at).toLocaleString()}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/70">{row.body}</p>
              {row.reply ? (
                <div className="mt-3 rounded-xl border border-[#E2B42A]/25 bg-[#E2B42A]/08 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#E2B42A]">
                    Desk reply
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/80">{row.reply}</p>
                  {row.replied_at ? (
                    <p className="mt-1 text-[11px] text-white/30">
                      {new Date(row.replied_at).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-3">
                  <textarea
                    rows={3}
                    value={drafts[row.id] ?? ""}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [row.id]: e.target.value }))
                    }
                    placeholder="Write a reply…"
                    className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#E2B42A]"
                  />
                  <button
                    type="button"
                    disabled={busy === row.id || !(drafts[row.id] || "").trim()}
                    onClick={() => void saveReply(row.id)}
                    className="mt-2 rounded-full bg-[#E2B42A] px-4 py-2 text-[12px] font-semibold text-[#1A1408] hover:bg-[#F0C54A] disabled:opacity-40"
                  >
                    {busy === row.id ? "Saving…" : "Send reply"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
