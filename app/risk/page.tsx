import Link from "next/link";

const RULES = [
  {
    title: "Risk per trade",
    body: "Keep risk at or below 0.5% to 1% per plan. If the stop is wide, size down. Never widen the published SL to keep a larger lot.",
  },
  {
    title: "Maximum exposure",
    body: "Do not stack correlated gold positions. One idea, one risk budget. A second ticket in the same direction is the same bet.",
  },
  {
    title: "Stop loss discipline",
    body: "Published SL is the invalidation level. If it prints, the idea is done. No revenge add, no “let it come back”.",
  },
  {
    title: "Position sizing",
    body: "Size from entry-to-SL distance, never from targets. TP1/TP2/TP3 are optional; the stop is not.",
  },
];

const START = [
  {
    title: "Read the plan first",
    body: "Direction, zone, SL and targets are one unit. Do not take the side and ignore the stop.",
  },
  {
    title: "Wait for the zone",
    body: "Do not chase a limit plan through the published band. If price has left the zone, skip the ticket.",
  },
  {
    title: "Honor invalidation",
    body: "If SL prints, flatten. A new ticket is a new plan, not a continuation of the dead one.",
  },
];

export default function RiskPage() {
  return (
    <div className="bg-[#050505] text-white">
      <section className="hero-wash px-6 pb-20 pt-[118px] md:pt-[132px]">
        <div className="relative z-10 mx-auto max-w-[1240px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Desk rules
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
            Risk
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
            Tickets are execution plans, not promises. Protect the account first.
          </p>

          <p className="mb-4 mt-10 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Risk management
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {RULES.map((rule, index) => (
              <article
                key={rule.title}
                className="group relative overflow-hidden rounded-[28px] bg-[#121212] p-7 ring-1 ring-white/[0.06]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -bottom-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(226,180,42,0.22),transparent_68%)] blur-sm"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#E2B42A]/35 to-transparent"
                />
                <p className="relative font-mono text-[11px] tracking-[0.22em] text-[#E2B42A]/80">
                  0{index + 1}
                </p>
                <p className="relative mt-4 text-[22px] font-semibold tracking-[-0.03em] text-white">
                  {rule.title}
                </p>
                <p className="relative mt-3 text-[14px] leading-6 text-white/50">{rule.body}</p>
              </article>
            ))}
          </div>

          <p className="mb-4 mt-12 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Getting started
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {START.map((rule, index) => (
              <article
                key={rule.title}
                className="relative overflow-hidden rounded-[28px] bg-[#121212] p-7 ring-1 ring-white/[0.06]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(80%_80%_at_20%_100%,rgba(226,180,42,0.16),transparent_70%)]"
                />
                <p className="relative text-[12px] font-medium text-[#E2B42A]">0{index + 1}</p>
                <p className="relative mt-3 text-[20px] font-semibold tracking-[-0.02em] text-white">
                  {rule.title}
                </p>
                <p className="relative mt-3 text-[14px] leading-6 text-white/50">{rule.body}</p>
              </article>
            ))}
          </div>

          <div className="relative mt-12 overflow-hidden rounded-[28px] bg-[#121212] p-7 ring-1 ring-white/[0.06]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(80%_80%_at_0%_50%,rgba(226,180,42,0.14),transparent_70%)]"
            />
            <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-[#E2B42A]">
              Not financial advice
            </p>
            <p className="relative mt-3 max-w-2xl text-sm leading-6 text-white/55">
              Trading gold involves risk of loss, including loss of capital.
              Published tickets are educational execution notes. Past pips on
              this desk are illustrative unless marked live. You size and click
              the order. We do not manage your account.
            </p>
            <Link
              href="/legal"
              className="relative mt-5 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#E2B42A] hover:text-white"
            >
              Full disclaimer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
