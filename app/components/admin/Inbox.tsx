"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const PAGE_SIZE = 5;

export function Inbox() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  // Phân trang & Bộ lọc
  const [filter, setFilter] = useState<"all" | "pending" | "replied">("all");
  const [page, setPage] = useState(1);

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

  // Lọc tin nhắn
  const filteredRows = useMemo(() => {
    if (filter === "pending") return rows.filter((r) => !r.reply);
    if (filter === "replied") return rows.filter((r) => Boolean(r.reply));
    return rows;
  }, [rows, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const displayedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  if (!hasSupabase()) {
    return (
      <p className="mt-6 text-sm text-white/35">
        Chưa kết nối máy chủ tài khoản Supabase.
      </p>
    );
  }

  const pendingCount = rows.filter((r) => !r.reply).length;

  return (
    <div className="rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06] md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E2B42A]">
            Hộp thư hỗ trợ (Support Inbox)
          </p>
          <p className="mt-1 text-sm text-white/40">
            Tổng cộng: {rows.length} tin nhắn · {pendingCount} tin chờ trả lời
          </p>
        </div>

        {/* Nút lọc tin nhắn */}
        <div className="flex rounded-xl bg-white/[0.04] p-1 ring-1 ring-white/10">
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === "all"
                ? "bg-[#E2B42A] text-[#1A1408]"
                : "text-white/50 hover:text-white"
            }`}
          >
            Tất cả ({rows.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter("pending");
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === "pending"
                ? "bg-[#E2B42A] text-[#1A1408]"
                : "text-white/50 hover:text-white"
            }`}
          >
            Chờ trả lời ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter("replied");
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === "replied"
                ? "bg-[#E2B42A] text-[#1A1408]"
                : "text-white/50 hover:text-white"
            }`}
          >
            Đã trả lời ({rows.length - pendingCount})
          </button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-[#E35A5A]">{error}</p> : null}

      {displayedRows.length === 0 && !error ? (
        <p className="mt-6 text-center text-sm text-white/40 py-8">
          Không có tin nhắn nào trong mục này.
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {displayedRows.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-white">
                  {row.name}{" "}
                  <span className="text-xs font-normal text-white/40">
                    ({row.email})
                  </span>
                </p>
                <span className="text-xs text-white/30">
                  {new Date(row.created_at).toLocaleString("vi-VN")}
                </span>
              </div>

              <div className="mt-3 rounded-xl bg-white/[0.02] p-3 text-sm leading-6 text-white/80">
                {row.body}
              </div>

              {row.reply ? (
                <div className="mt-3 rounded-xl border border-[#E2B42A]/25 bg-[#E2B42A]/08 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#E2B42A]">
                      Admin đã trả lời
                    </p>
                    {row.replied_at ? (
                      <span className="text-[11px] text-white/30">
                        {new Date(row.replied_at).toLocaleString("vi-VN")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-white/90">
                    {row.reply}
                  </p>
                </div>
              ) : (
                <div className="mt-3">
                  <textarea
                    rows={3}
                    value={drafts[row.id] ?? ""}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [row.id]: e.target.value }))
                    }
                    placeholder="Nhập câu trả lời cho thành viên..."
                    className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#E2B42A]"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={busy === row.id || !(drafts[row.id] || "").trim()}
                      onClick={() => void saveReply(row.id)}
                      className="rounded-full bg-[#E2B42A] px-5 py-2 text-[12px] font-bold text-[#1A1408] transition hover:bg-[#F0C54A] disabled:opacity-40"
                    >
                      {busy === row.id ? "Đang gửi..." : "Gửi phản hồi"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Thanh điều hướng Phân trang (Pagination) */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
          <p className="text-xs text-white/40">
            Trang {currentPage} / {totalPages} (Hiển thị {displayedRows.length} tin)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5"
            >
              Trang trước
            </button>
            <span className="px-2 text-xs font-bold text-[#E2B42A]">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
