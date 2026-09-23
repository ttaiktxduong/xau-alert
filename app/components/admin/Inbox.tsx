"use client";

import { useEffect, useState } from "react";
import { getSupabase, hasSupabase } from "../../lib/supabase";

type Row = {
  id: string;
  name: string;
  email: string;
  body: string;
  created_at: string;
};

export function Inbox() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasSupabase()) return;
    const sb = getSupabase();
    if (!sb) return;
    sb.from("messages")
      .select("id,name,email,body,created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setRows((data as Row[]) || []);
      });
  }, []);

  if (!hasSupabase()) {
    return (
      <p className="mt-6 text-sm text-white/35">
        Chưa gắn Supabase — tin Support chỉ hiện sau khi thêm URL + anon key.
      </p>
    );
  }

  return (
    <div className="mt-8 rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E2B42A]">
        Support inbox
      </p>
      {error ? <p className="mt-3 text-sm text-[#E35A5A]">{error}</p> : null}
      {rows.length === 0 && !error ? (
        <p className="mt-3 text-sm text-white/40">Chưa có tin nhắn.</p>
      ) : (
        <ul className="mt-4 space-y-3">
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
