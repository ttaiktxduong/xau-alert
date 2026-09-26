import Link from "next/link";

export function Hero() {
  return (
    <section className="hero-wash px-6 pb-6 pt-[118px] md:pt-[132px]">
      <div className="relative z-10 mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className="max-w-3xl text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[64px]">
            <span className="text-[#E2B42A]">Trading intelligence </span>
            <span className="text-[#F3D78A]">for </span>
            <span className="text-white">disciplined execution</span>
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-7 text-white/60">
            Realtime gold trading plans built for disciplined execution.
            Signals, invalidation, and performance, without profit promises.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signals"
              className="inline-flex h-12 items-center rounded-full bg-[#E2B42A] px-7 text-[15px] font-medium text-[#1A1408] transition hover:bg-[#F0C54A]"
            >
              View Live Signals
            </Link>
            <Link
              href="#pricing"
              className="inline-flex h-12 items-center rounded-full bg-[#1a1a1a] px-7 text-[15px] font-medium text-white ring-1 ring-white/10 transition hover:bg-[#242424]"
            >
              Unlock VIP
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[420px] lg:mx-0 lg:justify-self-end">
          <article className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0b]/90 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-sm">
            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <div>
                <p className="text-[15px] font-medium text-white">Live gold plan</p>
                <p className="mt-0.5 text-[12px] text-white/40">Entry zone locked until VIP</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E2B42A] text-[13px] font-bold text-[#1A1408]">
                AU
              </span>
            </div>

            <div className="relative mx-auto mt-8 grid h-[220px] place-items-center">
              <span className="absolute h-44 w-44 rounded-full border border-[#E2B42A]/15" />
              <span className="absolute h-32 w-32 rounded-full border border-[#E2B42A]/25" />
              <span className="absolute h-20 w-20 rounded-full border border-[#E2B42A]/40" />
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#E2B42A] text-[#1A1408] shadow-[0_0_40px_rgba(226,180,42,0.35)]">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                  <path
                    d="M6 12.5 10.2 16.5 18 8.5"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            <div className="mt-2 text-center">
              <p className="text-[28px] font-semibold tracking-tight text-white">BUY LIMIT</p>
              <p className="mt-1 text-[13px] text-white/40">New plan</p>
            </div>
          </article>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-14 grid max-w-[1240px] gap-6 border-t border-white/[0.06] pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Signals with SL", "Every live plan ships with invalidation."],
          ["No profit promises", "Discipline first. Results are not guaranteed."],
          ["Tracked performance", "Open ledger by day, week, month."],
          ["VIP entry unlock", "Zones and stops stay locked until access."],
        ].map(([title, body]) => (
          <div key={title} className="border-l-2 border-[#E2B42A] pl-4">
            <p className="text-[16px] font-medium text-white">{title}</p>
            <p className="mt-1.5 text-[13px] leading-5 text-white/45">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
