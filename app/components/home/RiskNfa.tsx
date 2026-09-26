import Link from "next/link";

const RULES = [
  {
    title: "Risk per trade",
    body: "Keep risk at or below 0.5% to 1% per plan.",
  },
  {
    title: "Maximum exposure",
    body: "Do not stack correlated gold positions.",
  },
  {
    title: "Stop loss discipline",
    body: "Published SL is the invalidation level.",
  },
  {
    title: "Position sizing",
    body: "Size from entry-to-SL distance, never from targets.",
  },
] as const;

export function RiskNfa() {
  return (
    <section className="px-6 pb-20">
      <div className="mx-auto max-w-[1240px]">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          Risk management
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {RULES.map((rule, index) => (
            <Link
              key={rule.title}
              href="/risk"
              className="group relative overflow-hidden rounded-[28px] bg-[#0e0e0e] p-7 ring-1 ring-white/[0.06] transition duration-500 hover:-translate-y-0.5 hover:ring-[#E2B42A]/25"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -left-16 top-0 h-full w-40 bg-[radial-gradient(ellipse_at_center,rgba(226,180,42,0.14),transparent_70%)] opacity-80 transition duration-500 group-hover:opacity-100"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -bottom-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(226,180,42,0.28),transparent_68%)] blur-sm transition duration-500 group-hover:scale-110"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#E2B42A]/40 to-transparent"
              />

              <div className="relative flex items-start justify-between gap-4">
                <span className="font-mono text-[11px] tracking-[0.22em] text-[#E2B42A]/80">
                  0{index + 1}
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white/40 ring-1 ring-white/10 transition duration-500 group-hover:bg-[#E2B42A] group-hover:text-[#1A1408] group-hover:ring-[#E2B42A]">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                    <path
                      d="M7 17 17 7M9 7h8v8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>

              <p className="relative mt-6 text-[24px] font-semibold tracking-[-0.03em] text-white">
                {rule.title}
              </p>
              <p className="relative mt-3 max-w-sm text-[14px] leading-6 text-white/48">
                {rule.body}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-sm leading-6 text-white/40">
            Trading gold involves risk of loss. Published tickets are not
            financial advice. This is not a live guarantee of results.
          </p>
          <Link
            href="/risk"
            className="shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E2B42A] transition hover:text-white"
          >
            Risk rules
          </Link>
        </div>
      </div>
    </section>
  );
}
