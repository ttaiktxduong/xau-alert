"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { NotificationBell } from "./NotificationBell";
import { isAdmin } from "../../lib/admin";
import { roleLabel, useRole } from "../../lib/roles";

const NAV: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/signals", label: "Live signals" },
  { href: "/performance", label: "Performance" },
  { href: "/risk", label: "Risk" },
  { href: "/support", label: "Support" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const chipLabel = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Guest";
  const role = useRole(user?.email);
  const desk = role === "admin";
  const items: { href: string; label: string }[] = desk
    ? [...NAV.filter((item) => item.href !== "/support"), { href: "/admin", label: "Admin" }]
    : NAV;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="pointer-events-auto mx-auto max-w-[1240px]">
        <header className="relative flex h-[58px] items-center gap-2 rounded-full bg-[#120e0a]/80 px-2.5 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.08] backdrop-blur-xl sm:h-[62px] sm:px-3">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-y-0 left-0 w-[42%] bg-[radial-gradient(120%_140%_at_0%_50%,rgba(226,180,42,0.22),transparent_70%)]" />
            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-[#E2B42A]/10" />
          </div>

          <Link
            href="/"
            className="relative z-10 flex h-11 shrink-0 items-center gap-2.5 rounded-full pl-1 pr-2"
            onClick={() => setOpen(false)}
          >
            <img src="/logo-xau.jpg" alt="" className="h-9 w-9 rounded-lg object-cover" />
            <span className="flex items-baseline gap-1.5 leading-none">
              <span className="text-[17px] font-semibold tracking-wide">XAU</span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E2B42A] sm:inline">
                Classic
              </span>
            </span>
          </Link>

          <nav className="relative z-10 hidden flex-1 items-center justify-center gap-7 lg:flex">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-[14px] transition-colors ${
                    active ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="relative z-10 ml-auto flex items-center gap-1 sm:gap-1.5">
            {user ? <NotificationBell /> : null}

            {!ready ? (
              <div className="h-10 w-36 animate-pulse rounded-full bg-white/10" />
            ) : user ? (
              <Link
                href="/account"
                className="hidden h-10 items-center gap-2 rounded-full px-1.5 pr-3 text-sm font-medium text-white/85 transition hover:bg-white/5 hover:text-white md:flex"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#E2B42A] text-xs font-bold text-[#1A1408]">
                  {chipLabel.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{chipLabel}</span>
                {role === "admin" || role === "vip" ? (
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#E2B42A]">
                    {roleLabel(role)}
                  </span>
                ) : null}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden px-3 text-[14px] text-white/85 transition hover:text-white sm:inline"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#E2B42A] px-4 text-[13.5px] font-medium text-[#1A1408] transition hover:bg-[#F0C54A] sm:px-5"
                >
                  Get started
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
                    <path
                      d="M3 8h10M9.5 4.5 13 8l-3.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </>
            )}

            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full text-white lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="flex flex-col gap-1.5">
                <span className={`block h-px w-4 bg-current transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`block h-px w-4 bg-current transition ${open ? "opacity-0" : ""}`} />
                <span className={`block h-px w-4 bg-current transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </header>

        {open ? (
          <div className="mt-2 overflow-hidden rounded-[28px] border border-white/10 bg-[#120e0a]/95 p-3 text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:hidden">
            <nav className="flex flex-col">
              {items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-[15px] ${
                    isActive(pathname, item.href) ? "bg-white/5 text-white" : "text-white/70"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 p-2 pt-3">
              {user ? (
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="col-span-2 grid h-11 place-items-center rounded-full bg-white/5 text-sm text-white"
                >
                  {chipLabel}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="grid h-11 place-items-center rounded-full bg-white/5 text-sm text-white"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="grid h-11 place-items-center rounded-full bg-[#E2B42A] text-sm font-medium text-[#1A1408]"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Header;
