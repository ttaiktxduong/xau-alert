"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import { isAdmin, unlockDesk } from "../lib/admin";
import {
  addTicket,
  addClosedTicket,
  clearMockData,
  closeTicket,
  removeTicket,
  ticketTitle,
  useDesk,
} from "../lib/desk-store";
import { Members } from "../components/admin/Members";
import { Inbox } from "../components/admin/Inbox";

type AdminTab = "signals" | "inbox" | "members";
type TicketFormMode = "live" | "historical";

const RESULTS = ["Hit TP1", "Hit TP2", "Hit TP3", "Stopped", "Canceled"];

const field =
  "w-full rounded-xl border border-white/10 bg-[#1a1610] px-3 py-2.5 text-sm text-white outline-none [color-scheme:dark] placeholder:text-white/25 focus:border-[#E2B42A]";
const menu = "bg-[#1a1610] text-white";

export default function AdminPage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const { tickets } = useDesk();

  // Tab điều hướng chính
  const [activeTab, setActiveTab] = useState<AdminTab>("signals");
  const [formMode, setFormMode] = useState<TicketFormMode>("live");

  // Form phát hành lệnh
  const [side, setSide] = useState<"sell" | "buy">("sell");
  const [setup, setSetup] = useState<"limit" | "market">("limit");
  const [status, setStatus] = useState("New plan");
  const [vip, setVip] = useState(false);
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp1, setTp1] = useState("");
  const [tp2, setTp2] = useState("");
  const [tp3, setTp3] = useState("");
  const [note, setNote] = useState("");

  // Trường cho nhập lệnh lịch sử (Historical Closed Trade)
  const [histResult, setHistResult] = useState("Hit TP1");
  const [histPips, setHistPips] = useState("45");
  const [histEntryDate, setHistEntryDate] = useState(() =>
    new Date(Date.now() - 3600000).toISOString().slice(0, 16)
  );
  const [histCloseDate, setHistCloseDate] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );

  // Modal đóng lệnh
  const [closing, setClosing] = useState<string | null>(null);
  const [result, setResult] = useState("Hit TP1");
  const [pips, setPips] = useState("0");
  const [closeNote, setCloseNote] = useState("");

  // Modal xóa lệnh
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Mở khóa desk
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem("xau-desk-unlock") === "1";
    } catch {
      return false;
    }
  });
  const [deskPass, setDeskPass] = useState("");
  const [deskError, setDeskError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin(user.email)) router.replace("/account");
  }, [ready, user, router]);

  if (!ready || !user || !isAdmin(user.email)) {
    return (
      <div className="bg-[#050505] px-6 pb-20 pt-[118px] text-center text-sm text-white/40">
        Đang tải trang quản trị…
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-full bg-[#050505] text-white">
        <section className="hero-wash px-6 pb-20 pt-[118px] md:pt-[132px]">
          <div className="relative z-10 mx-auto max-w-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
              Bảo mật hệ thống
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
              Xác thực quyền Admin
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Vui lòng nhập mật khẩu desk để truy cập các chức năng điều khiển.
            </p>

            <form
              className="mt-8 rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06]"
              onSubmit={(e) => {
                e.preventDefault();
                if (unlockDesk(deskPass)) {
                  setUnlocked(true);
                  setDeskError("");
                } else {
                  setDeskError("Mật khẩu desk không chính xác.");
                }
              }}
            >
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Mật khẩu Desk
                <input
                  type="password"
                  className={`${field} mt-2`}
                  value={deskPass}
                  onChange={(e) => setDeskPass(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                />
              </label>
              {deskError && (
                <p className="mt-3 text-sm text-[#E35A5A]">{deskError}</p>
              )}
              <button
                type="submit"
                className="mt-5 w-full rounded-full bg-[#E2B42A] px-5 py-2.5 text-[13px] font-semibold text-[#1A1408] transition hover:bg-[#F0C54A]"
              >
                Mở khóa bảng điều khiển
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="mt-4 w-full text-center text-[13px] font-semibold text-white/45 hover:text-white"
            >
              Đăng xuất
            </button>
          </div>
        </section>
      </div>
    );
  }

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (formMode === "live") {
      addTicket({
        side,
        setup,
        status,
        vip,
        entry: entry || undefined,
        sl: sl || undefined,
        tp1: tp1 || undefined,
        tp2: tp2 || undefined,
        tp3: tp3 || undefined,
        note: note.trim() || undefined,
      });
      setEntry("");
      setSl("");
      setTp1("");
      setTp2("");
      setTp3("");
      setNote("");
      setStatus("New plan");
    } else {
      // Chế độ nhập lệnh lịch sử đã chốt
      const cTime = new Date(histCloseDate).getTime() || Date.now();
      const eTime = new Date(histEntryDate).getTime() || cTime - 3600000;
      addClosedTicket({
        side,
        setup,
        vip,
        entry: entry || undefined,
        sl: sl || undefined,
        tp1: tp1 || undefined,
        tp2: tp2 || undefined,
        tp3: tp3 || undefined,
        result: histResult,
        pips: Number(histPips) || 0,
        createdAt: eTime,
        closedAt: cTime,
        note: note.trim() || undefined,
      });
      setEntry("");
      setSl("");
      setTp1("");
      setTp2("");
      setTp3("");
      setNote("");
    }
  }

  const openTickets = tickets.filter((t) => t.open);
  const closedTickets = tickets.filter((t) => !t.open);

  return (
    <div className="min-h-full bg-[#050505] text-white">
      <section className="hero-wash px-6 pb-20 pt-[118px] md:pt-[132px]">
        <div className="relative z-10 mx-auto max-w-[1240px]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#E2B42A]">
                Cfd Aurix Desk
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                Bảng điều khiển Admin
              </h1>
              <p className="mt-1 text-sm text-white/50">
                Quản trị tín hiệu Cfd Aurix, xử lý hỗ trợ và quản lý quyền thành viên.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 transition hover:border-white/30 hover:text-white"
            >
              Đăng xuất
            </button>
          </div>

          {/* THANH ĐIỀU HƯỚNG 3 TAB CHÍNH */}
          <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setActiveTab("signals")}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition ${
                activeTab === "signals"
                  ? "bg-[#E2B42A] text-[#1A1408] shadow-lg"
                  : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              📊 Điều khiển lệnh
              <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs font-normal">
                {openTickets.length} mở · {closedTickets.length} đã chốt
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("inbox")}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition ${
                activeTab === "inbox"
                  ? "bg-[#E2B42A] text-[#1A1408] shadow-lg"
                  : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              💬 Quản lý tin nhắn
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("members")}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition ${
                activeTab === "members"
                  ? "bg-[#E2B42A] text-[#1A1408] shadow-lg"
                  : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              👥 Quản lý người dùng
            </button>
          </div>

          {/* ==================== TAB 1: ĐIỀU KHIỂN LỆNH ==================== */}
          {activeTab === "signals" && (
            <div className="mt-6 space-y-8">
              {/* Form phát hành hoặc nhập lệnh lịch sử */}
              <form
                onSubmit={onCreate}
                className="rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06] md:p-7"
              >
                {/* Lựa chọn chế độ nhập */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="flex rounded-xl bg-white/[0.04] p-1 ring-1 ring-white/10">
                    <button
                      type="button"
                      onClick={() => setFormMode("live")}
                      className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                        formMode === "live"
                          ? "bg-[#E2B42A] text-[#1A1408]"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      🟢 Phát hành lệnh mới (Đang chạy)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormMode("historical")}
                      className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                        formMode === "historical"
                          ? "bg-[#E2B42A] text-[#1A1408]"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      📜 Nhập lệnh lịch sử thật (Đã chốt vào Performance)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Bạn có chắc muốn xóa các lệnh mẫu cũ (t1..t8) để chỉ hiển thị dữ liệu thật?")) {
                        clearMockData();
                      }
                    }}
                    className="rounded-lg border border-red-500/20 bg-red-500/08 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/15"
                  >
                    🧹 Xóa sạch lệnh mẫu (Chỉ giữ số thật)
                  </button>
                </div>

                {/* Phân loại quyền: FREE vs VIP */}
                <div className="mt-5 rounded-2xl border border-white/10 bg-[#16120b] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                    Phân loại quyền truy cập lệnh
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => setVip(false)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                        !vip
                          ? "border border-[#3DCF86]/60 bg-[#3DCF86] text-[#050505] shadow-md"
                          : "border border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      🟢 Lệnh FREE (Công khai cho toàn bộ khách xem để tạo uy tín)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVip(true)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                        vip
                          ? "border border-[#E2B42A]/60 bg-[#E2B42A] text-[#1A1408] shadow-md"
                          : "border border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      👑 Lệnh VIP (Khóa Entry & SL, chỉ thành viên VIP mới xem được)
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-white/40">
                    {!vip
                      ? "Khách truy cập và thành viên thường sẽ xem được toàn bộ Entry, Stop Loss và TP của lệnh này."
                      : "Khách truy cập và thành viên thường sẽ thấy lệnh bị khóa mờ Entry & SL."}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                    Loại lệnh (Side)
                    <select
                      className={`${field} mt-2`}
                      value={side}
                      onChange={(e) => setSide(e.target.value as "sell" | "buy")}
                    >
                      <option className={menu} value="sell">Sell</option>
                      <option className={menu} value="buy">Buy</option>
                    </select>
                  </label>

                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                    Cách vào lệnh (Setup)
                    <select
                      className={`${field} mt-2`}
                      value={setup}
                      onChange={(e) => setSetup(e.target.value as "limit" | "market")}
                    >
                      <option className={menu} value="limit">Limit</option>
                      <option className={menu} value="market">Market</option>
                    </select>
                  </label>

                  {formMode === "live" ? (
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                      Trạng thái (Status)
                      <input
                        className={`${field} mt-2`}
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        placeholder="New plan / Running / Waiting zone"
                      />
                    </label>
                  ) : (
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                      Kết quả chốt (Result)
                      <select
                        className={`${field} mt-2`}
                        value={histResult}
                        onChange={(e) => setHistResult(e.target.value)}
                      >
                        {RESULTS.map((res) => (
                          <option key={res} className={menu} value={res}>
                            {res}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {formMode === "historical" ? (
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                      Lợi nhuận Pips (+ hoặc -)
                      <input
                        type="number"
                        step="0.1"
                        className={`${field} mt-2`}
                        value={histPips}
                        onChange={(e) => setHistPips(e.target.value)}
                        placeholder="Ví dụ: 45 hoặc -18"
                        required
                      />
                    </label>
                  ) : (
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                      Vùng vào lệnh (Entry zone)
                      <input
                        className={`${field} mt-2`}
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        placeholder="2648–2652"
                      />
                    </label>
                  )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {formMode === "historical" && (
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                      Vùng vào lệnh (Entry zone)
                      <input
                        className={`${field} mt-2`}
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        placeholder="2648–2652"
                      />
                    </label>
                  )}

                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                    Dừng lỗ (Stop loss)
                    <input
                      className={`${field} mt-2`}
                      value={sl}
                      onChange={(e) => setSl(e.target.value)}
                      placeholder="2661"
                    />
                  </label>

                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                    Chốt lời 1 (TP1)
                    <input
                      className={`${field} mt-2`}
                      value={tp1}
                      onChange={(e) => setTp1(e.target.value)}
                      placeholder="2638"
                    />
                  </label>

                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                    Chốt lời 2 (TP2)
                    <input
                      className={`${field} mt-2`}
                      value={tp2}
                      onChange={(e) => setTp2(e.target.value)}
                      placeholder="2629"
                    />
                  </label>
                </div>

                {/* Nếu là nhập lệnh lịch sử: Thêm trường chọn Ngày/Giờ vào & chốt lệnh */}
                {formMode === "historical" && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                      Thời điểm vào lệnh
                      <input
                        type="datetime-local"
                        className={`${field} mt-2`}
                        value={histEntryDate}
                        onChange={(e) => setHistEntryDate(e.target.value)}
                      />
                    </label>
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                      Thời điểm chốt lệnh
                      <input
                        type="datetime-local"
                        className={`${field} mt-2`}
                        value={histCloseDate}
                        onChange={(e) => setHistCloseDate(e.target.value)}
                      />
                    </label>
                  </div>
                )}

                {/* Ô Ghi chú kế hoạch lệnh */}
                <div className="mt-4">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                    {formMode === "live"
                      ? "Ghi chú kế hoạch lệnh (Tùy chọn)"
                      : "Lý do / Bài học / Ghi chú kết quả"}
                    <input
                      className={`${field} mt-2`}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ví dụ: Bắt phản ứng cản H4, tin Nonfarm ra mạnh,..."
                    />
                  </label>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-[#E2B42A] px-7 py-3 text-sm font-bold text-[#1A1408] transition hover:bg-[#F0C54A]"
                  >
                    {formMode === "live"
                      ? "Phát hành lệnh mới"
                      : "Lưu vào sổ cái Performance"}
                  </button>
                </div>
              </form>

              {/* Danh sách các lệnh đang hoạt động */}
              <div className="rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06] md:p-7">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-white">
                    Lệnh đang mở ({openTickets.length})
                  </p>
                </div>

                {openTickets.length === 0 ? (
                  <p className="mt-4 text-sm text-white/40">Hiện không có lệnh nào đang mở.</p>
                ) : (
                  <div className="mt-4 divide-y divide-white/5">
                    {openTickets.map((t) => (
                      <div key={t.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-white">
                              {ticketTitle(t)}
                            </span>
                            {t.vip ? (
                              <span className="rounded-full border border-[#E2B42A]/40 bg-[#E2B42A]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#E2B42A]">
                                VIP
                              </span>
                            ) : (
                              <span className="rounded-full border border-[#3DCF86]/40 bg-[#3DCF86]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#3DCF86]">
                                FREE
                              </span>
                            )}
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                              {t.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-white/50">
                            Entry: <strong className="text-white">{t.entry || "—"}</strong> · SL: <strong className="text-white">{t.sl || "—"}</strong> · TP1: <strong className="text-white">{t.tp1 || "—"}</strong>
                          </p>
                          {t.note && (
                            <p className="mt-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1 text-xs text-amber-200/80">
                              📝 Ghi chú: {t.note}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setClosing(t.id);
                              setCloseNote("");
                            }}
                            className="rounded-xl bg-[#E2B42A]/15 px-3.5 py-2 text-xs font-bold text-[#E2B42A] transition hover:bg-[#E2B42A] hover:text-[#1A1408]"
                          >
                            Đóng / Chốt lệnh
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingId(t.id);
                              setDeleteReason("");
                            }}
                            className="rounded-xl bg-red-500/10 px-3.5 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                          >
                            Xóa lệnh
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Modal Chốt kết quả lệnh */}
                {closing && (
                  <div className="mt-6 rounded-2xl border border-amber-500/30 bg-[#16120b] p-5 shadow-2xl">
                    <p className="text-sm font-bold text-white">Chốt kết quả cho lệnh:</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {RESULTS.map((res) => (
                        <button
                          key={res}
                          type="button"
                          onClick={() => setResult(res)}
                          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                            result === res
                              ? "bg-[#E2B42A] text-[#1A1408]"
                              : "bg-white/5 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="text-xs text-white/50">
                        Số pips đạt được (+ hoặc -):
                        <input
                          type="number"
                          step="0.1"
                          className={`${field} mt-1.5`}
                          placeholder="Ví dụ: 45 hoặc -15"
                          value={pips}
                          onChange={(e) => setPips(e.target.value)}
                        />
                      </label>
                      <label className="text-xs text-white/50">
                        Lý do / Ghi chú đóng lệnh:
                        <input
                          className={`${field} mt-1.5`}
                          placeholder="Ví dụ: Đạt TP1 dời SL hòa vốn, tin ra mạnh,..."
                          value={closeNote}
                          onChange={(e) => setCloseNote(e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setClosing(null)}
                        className="rounded-xl bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          closeTicket(closing, result, Number(pips) || 0, closeNote);
                          setClosing(null);
                        }}
                        className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-black hover:bg-emerald-400"
                      >
                        Xác nhận đóng lệnh
                      </button>
                    </div>
                  </div>
                )}

                {/* Modal Xóa lệnh kèm Lý do */}
                {deletingId && (
                  <div className="mt-6 rounded-2xl border border-red-500/30 bg-[#170a0a] p-5 shadow-2xl">
                    <p className="text-sm font-bold text-red-400">Xác nhận xóa lệnh:</p>
                    <p className="mt-1 text-xs text-white/50">
                      Vui lòng nhập lý do xóa lệnh:
                    </p>
                    <input
                      className={`${field} mt-3 border-red-500/20 focus:border-red-400`}
                      placeholder="Ví dụ: Hụt entry, sideway quá lâu, thị trường biến động xấu,..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="rounded-xl bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeTicket(deletingId);
                          setDeletingId(null);
                        }}
                        className="rounded-xl bg-red-500 px-5 py-2 text-xs font-bold text-white hover:bg-red-600"
                      >
                        Xóa lệnh vĩnh viễn
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Lịch sử lệnh đã đóng */}
              <div className="rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06] md:p-7">
                <p className="text-base font-semibold text-white">
                  Lịch sử lệnh đã đóng ({closedTickets.length})
                </p>
                <div className="mt-4 divide-y divide-white/5">
                  {closedTickets.map((t) => (
                    <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{ticketTitle(t)}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              (t.pips ?? 0) >= 0
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {t.result || "Closed"} ({(t.pips ?? 0) >= 0 ? "+" : ""}{t.pips} pips)
                          </span>
                          <span className="text-xs text-white/30">
                            {t.closedAt ? new Date(t.closedAt).toLocaleDateString("vi-VN") : "—"}
                          </span>
                        </div>
                        {t.note && (
                          <p className="mt-1 text-xs text-white/40">
                            📝 {t.note}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTicket(t.id)}
                        className="text-xs text-red-400/60 hover:text-red-400"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: QUẢN LÝ TIN NHẮN (PHÂN TRANG) ==================== */}
          {activeTab === "inbox" && (
            <div className="mt-6">
              <Inbox />
            </div>
          )}

          {/* ==================== TAB 3: QUẢN LÝ NGƯỜI DÙNG ==================== */}
          {activeTab === "members" && (
            <div className="mt-6">
              <Members />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}