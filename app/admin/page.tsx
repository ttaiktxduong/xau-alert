"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Inbox } from "../components/admin/Inbox";
import { useAuth } from "../components/auth/AuthProvider";
import { deskUnlocked, isAdmin, lockDesk, unlockDesk } from "../lib/admin";
import {
  addTicket,
  ageLabel,
  closeTicket,
  removeTicket,
  resetDesk,
  ticketTitle,
  updateTicket,
  useDesk,
  type Result,
  type Setup,
  type Side,
} from "../lib/desk-store";

const RESULTS: Result[] = ["Hit TP1", "Hit TP2", "Hit TP3", "Stopped", "Canceled"];

const field =
  "w-full rounded-xl border border-white/10 bg-[#1a1610] px-3 py-2.5 text-sm text-white outline-none [color-scheme:dark] placeholder:text-white/25 focus:border-[#E2B42A]";

const menu =
  "bg-[#1a1610] text-white";

export default function AdminPage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const { tickets } = useDesk();
  const [side, setSide] = useState<Side>("sell");
  const [setup, setSetup] = useState<Setup>("limit");
  const [status, setStatus] = useState("New plan");
  const [vip, setVip] = useState(true);
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp1, setTp1] = useState("");
  const [tp2, setTp2] = useState("");
  const [tp3, setTp3] = useState("");
  const [closing, setClosing] = useState<string | null>(null);
  const [result, setResult] = useState<Result>("Hit TP1");
  const [pips, setPips] = useState("0");
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
        Loading…
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-full bg-[#050505] text-white">
        <section className="hero-wash px-6 pb-20 pt-[118px] md:pt-[132px]">
          <div className="relative z-10 mx-auto max-w-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
              Desk lock
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
              Admin pass
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Admin email is not enough. Enter the desk password to edit tickets.
            </p>
            <form
              className="mt-8 rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06]"
              onSubmit={(e) => {
                e.preventDefault();
                if (unlockDesk(deskPass)) {
                  setUnlocked(true);
                  setDeskError("");
                } else {
                  setDeskError("Wrong desk password.");
                }
              }}
            >
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Desk password
                <input
                  type="password"
                  className={`${field} mt-2`}
                  value={deskPass}
                  onChange={(e) => setDeskPass(e.target.value)}
                />
              </label>
              {deskError ? <p className="mt-3 text-sm text-[#E35A5A]">{deskError}</p> : null}
              <button
                type="submit"
                className="mt-5 w-full rounded-full bg-[#E2B42A] px-5 py-2.5 text-[13px] font-semibold text-[#1A1408]"
              >
                Unlock
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
              Sign out
            </button>
          </div>
        </section>
      </div>
    );
  }

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
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
    });
    setEntry("");
    setSl("");
    setTp1("");
    setTp2("");
    setTp3("");
    setStatus("New plan");
  }

  return (
    <div className="min-h-full bg-[#050505] text-white">
      <section className="hero-wash px-6 pb-20 pt-[118px] md:pt-[132px]">
        <div className="relative z-10 mx-auto max-w-[1240px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Desk
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
            Admin
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
            Publish tickets here. Home, Signals, the bell and the ledger read
            the same desk store. Demo data stays in this browser.
          </p>

          <Inbox />

          <form
            onSubmit={onCreate}
            className="mt-8 rounded-[28px] bg-[#121212] p-6 ring-1 ring-white/[0.06] md:p-7"
          >
            <p className="text-[13px] font-semibold">New ticket</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Side
                <select
                  className={`${field} mt-2`}
                  value={side}
                  onChange={(e) => setSide(e.target.value as Side)}
                >
                  <option className={menu} value="sell">Sell</option>
                  <option className={menu} value="buy">Buy</option>
                </select>
              </label>
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Setup
                <select
                  className={`${field} mt-2`}
                  value={setup}
                  onChange={(e) => setSetup(e.target.value as Setup)}
                >
                  <option className={menu} value="limit">Limit</option>
                  <option className={menu} value="market">Market</option>
                </select>
              </label>
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Status
                <input
                  className={`${field} mt-2`}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />
              </label>
              <label className="flex items-end gap-2 pb-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={vip}
                  onChange={(e) => setVip(e.target.checked)}
                />
                VIP lock
              </label>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Entry
                <input className={`${field} mt-2`} inputMode="decimal" placeholder="2648–2652" value={entry} onChange={(e) => setEntry(e.target.value)} />
              </label>
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                SL
                <input className={`${field} mt-2`} inputMode="decimal" placeholder="2661" value={sl} onChange={(e) => setSl(e.target.value)} />
              </label>
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                TP1
                <input className={`${field} mt-2`} inputMode="decimal" placeholder="2638" value={tp1} onChange={(e) => setTp1(e.target.value)} />
              </label>
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                TP2
                <input className={`${field} mt-2`} inputMode="decimal" placeholder="2629" value={tp2} onChange={(e) => setTp2(e.target.value)} />
              </label>
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                TP3
                <input className={`${field} mt-2`} inputMode="decimal" placeholder="2618" value={tp3} onChange={(e) => setTp3(e.target.value)} />
              </label>
            </div>
            <button
              type="submit"
              className="mt-5 rounded-full bg-[#E2B42A] px-5 py-2.5 text-[13px] font-semibold text-[#1A1408] hover:bg-[#F0C54A]"
            >
              Publish ticket
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
              {tickets.length} tickets
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => resetDesk()}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/35 hover:text-white"
              >
                Reset demo
              </button>
              <button
                type="button"
                onClick={() => {
                  lockDesk();
                  setUnlocked(false);
                  setDeskPass("");
                }}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/35 hover:text-white"
              >
                Lock desk
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {tickets.map((t) => (
              <article
                key={t.id}
                className="rounded-[24px] bg-[#121212] p-5 ring-1 ring-white/[0.06]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] text-white/40">
                      {t.pair} · {ageLabel(t.createdAt)}
                    </p>
                    <p className="mt-1 text-[18px] font-semibold capitalize">
                      {ticketTitle(t)}
                    </p>
                    <p className="mt-1 text-sm text-white/45">{t.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {t.open ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            updateTicket(t.id, {
                              status:
                                t.status === "Running" ? "Waiting zone" : "Running",
                            })
                          }
                          className="rounded-full bg-white/5 px-3 py-1.5 text-[12px] text-white/70 hover:text-white"
                        >
                          Toggle status
                        </button>
                        <button
                          type="button"
                          onClick={() => setClosing(closing === t.id ? null : t.id)}
                          className="rounded-full bg-[#E2B42A] px-3 py-1.5 text-[12px] font-semibold text-[#1A1408]"
                        >
                          Close
                        </button>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-[#E2B42A]">
                        {(t.pips ?? 0) >= 0 ? "+" : ""}
                        {t.pips} pips
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeTicket(t.id)}
                      className="rounded-full bg-white/5 px-3 py-1.5 text-[12px] text-white/40 hover:text-[#E35A5A]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {t.entry || t.sl ? (
                  <p className="mt-3 text-[12px] text-white/35">
                    Entry {t.entry || "—"} · SL {t.sl || "—"} · TP {t.tp1 || "—"} /{" "}
                    {t.tp2 || "—"} / {t.tp3 || "—"}
                  </p>
                ) : null}
                {closing === t.id ? (
                  <form
                    className="mt-4 flex flex-wrap items-end gap-3 border-t border-white/8 pt-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      closeTicket(t.id, result, Number(pips) || 0);
                      setClosing(null);
                      setPips("0");
                    }}
                  >
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                      Result
                      <select
                        className={`${field} mt-2`}
                        value={result}
                        onChange={(e) => setResult(e.target.value as Result)}
                      >
                        {RESULTS.map((item) => (
                          <option className={menu} key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                      Pips
                      <input
                        className={`${field} mt-2`}
                        type="number"
                        step="0.1"
                        value={pips}
                        onChange={(e) => setPips(e.target.value)}
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded-full bg-[#E2B42A] px-4 py-2.5 text-[13px] font-semibold text-[#1A1408]"
                    >
                      Save close
                    </button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
