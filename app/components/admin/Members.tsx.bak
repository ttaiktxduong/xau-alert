"use client";

import { useEffect, useState } from "react";
import { getSupabase, hasSupabase } from "../../lib/supabase";

type Row = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export function Members() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.from("profiles")
      .select("id,name,email,created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setRows((data as Row[]) || []);
      });
  }, []);

  if (!hasSupabase()) {
    return (
      <p className="mt-6 text-sm text-white/35">
        Account server is not connected.
      </p>
    );
  }

  return (
    <div className="mt-8 rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E2B42A]">
        Members
      </p>
      <p className="mt-2 text-sm text-white/40">{rows.length} registered</p>
      {error ? <p className="mt-3 text-sm text-[#E35A5A]">{error}</p> : null}
      {rows.length === 0 && !error ? (
        <p className="mt-3 text-sm text-white/40">No members yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl bg-white/[0.03] px-4 py-3"
            >
              <span>
                <span className="block text-sm text-white">{row.name}</span>
                <span className="text-xs text-white/40">{row.email}</span>
              </span>
              <span className="text-xs text-white/30">
                {new Date(row.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
