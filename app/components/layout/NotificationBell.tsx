"use client";

// app/components/layout/NotificationBell.tsx
// Đọc notes từ app/lib/desk-store.ts (cùng nguồn với Admin).

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ageLabel, markAllNotesRead, markNoteRead, useDesk } from "../../lib/desk-store";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notes } = useDesk();
  const root = useRef<HTMLDivElement>(null);
  const unread = notes.filter((n) => n.unread).length;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label="Alerts"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-full text-white/80 transition hover:bg-white/5 hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
          <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
        </svg>
        {unread > 0 ? (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#E2B42A] px-1 text-[9px] font-bold leading-none text-[#1A1408]">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-white/10 bg-[#121212] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-[13px] font-semibold text-white">Notifications</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => markAllNotesRead()}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E2B42A] hover:text-white"
              >
                Mark all read
              </button>
            ) : (
              <span className="text-[11px] text-white/35">All caught up</span>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto border-t border-white/8">
            {notes.length === 0 ? (
              <p className="px-4 py-6 text-sm text-white/40">No notifications yet.</p>
            ) : (
              notes.map((note) => (
                <Link
                  key={note.id}
                  href={note.href}
                  onClick={() => {
                    markNoteRead(note.id);
                    setOpen(false);
                  }}
                  className="flex gap-3 px-4 py-3.5 transition hover:bg-white/[0.04]"
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      note.unread ? "bg-[#E2B42A]" : "bg-white/15"
                    }`}
                  />
                  <span>
                    <span className="block text-[14px] font-medium text-white">{note.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-white/45">{note.body}</span>
                    <span className="mt-1 block text-[11px] text-white/30">
                      {ageLabel(note.createdAt)}
                    </span>
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
