"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabase, hasSupabase } from "../../lib/supabase";
import { formatExpireDate, getDaysRemaining, isVipActive } from "../../lib/vip";

type Row = {
  id: string;
  name: string;
  email: string;
  role?: string;
  vip_plan?: string | null;
  vip_expires_at?: string | null;
  created_at: string;
};

export function Members() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchMembers = useCallback(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.from("profiles")
      .select("id,name,email,role,vip_plan,vip_expires_at,created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setRows((data as Row[]) || []);
      });
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const setVipDuration = async (id: string, days: number, plan: string = "vip") => {
    const sb = getSupabase();
    if (!sb) return;
    setLoadingId(id);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const { error: err } = await sb
      .from("profiles")
      .update({
        role: "vip",
        vip_plan: plan,
        vip_expires_at: expiresAt,
      })
      .eq("id", id);

    setLoadingId(null);
    if (err) setError(err.message);
    else fetchMembers();
  };

  const revokeVip = async (id: string) => {
    const sb = getSupabase();
    if (!sb) return;
    setLoadingId(id);
    const { error: err } = await sb
      .from("profiles")
      .update({
        role: "user",
        vip_plan: "none",
        vip_expires_at: null,
      })
      .eq("id", id);

    setLoadingId(null);
    if (err) setError(err.message);
    else fetchMembers();
  };

  if (!hasSupabase()) {
    return (
      <p className="mt-6 text-sm text-white/35">
        Chưa kết nối máy chủ tài khoản Supabase.
      </p>
    );
  }

  return (
    <div className="mt-8 rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E2B42A]">
            Quản lý thành viên (Members)
          </p>
          <p className="mt-1 text-sm text-white/40">{rows.length} người dùng đã đăng ký</p>
        </div>
        <button
          type="button"
          onClick={fetchMembers}
          className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white"
        >
          Làm mới
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-[#E35A5A]">{error}</p> : null}

      {rows.length === 0 && !error ? (
        <p className="mt-3 text-sm text-white/40">Chưa có thành viên nào.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => {
            const isVip = isVipActive(row.vip_expires_at);
            const days = getDaysRemaining(row.vip_expires_at);
            const isLoading = loadingId === row.id;

            return (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{row.name}</span>
                    {row.role === "admin" ? (
                      <span className="rounded-full border border-purple-400/40 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-300">
                        Admin
                      </span>
                    ) : isVip ? (
                      <span className="rounded-full border border-[#E2B42A]/40 bg-[#E2B42A]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#E2B42A]">
                        VIP ({days} ngày)
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase text-white/40">
                        Member
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-white/40">{row.email}</p>
                  {isVip && row.vip_expires_at ? (
                    <p className="mt-1 text-[11px] text-emerald-400">
                      Hạn dùng: {formatExpireDate(row.vip_expires_at)} (còn {days} ngày)
                    </p>
                  ) : null}
                </div>

                {row.role !== "admin" && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setVipDuration(row.id, 30, "vip")}
                      className="rounded-lg bg-[#E2B42A]/15 px-2.5 py-1.5 text-xs font-semibold text-[#E2B42A] transition hover:bg-[#E2B42A] hover:text-[#1A1408] disabled:opacity-50"
                    >
                      +30 ngày VIP
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setVipDuration(row.id, 7, "trial")}
                      className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      +7 ngày Trial
                    </button>
                    {isVip && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => revokeVip(row.id)}
                        className="rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        Hủy VIP
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
