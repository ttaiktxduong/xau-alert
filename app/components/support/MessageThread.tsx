"use client";

import { useEffect, useState } from "react";
import { getSupabase, hasSupabase } from "../../lib/supabase";

type Row = {
  id: string;
  body: string;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
};

export function MessageThread({ email }: { email: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasSupabase() || !email) return;
    const sb = getSupabase();
    if (!sb) return;
    sb.from("messages")
      .select("id,body,reply,replied_at,created_at")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setRows((data as Row[]) || []);
      });
  }, [email]);

  if (!hasSupabase()) return null;

  return (
    <div className="rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E2B42A]">
        Your messages
      </p>
      {error ? <p className="mt-3 text-sm text-[#E35A5A]">{error}</p> : null}
      {rows.length === 0 && !error ? (
        <p className="mt-3 text-sm text-white/40">No messages yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-2xl bg-white/[0.03] p-4">
              <p className="text-xs text-white/30">
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
                <p className="mt-2 text-xs text-white/35">Waiting for desk reply.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
