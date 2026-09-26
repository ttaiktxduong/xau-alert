import Link from "next/link";

const SECTIONS = [
  {
    title: "Not financial advice",
    body: "Cfdaurix publishes gold execution tickets for educational use. Nothing on this site is a recommendation to buy or sell any instrument. You are solely responsible for every order you place.",
  },
  {
    title: "Risk of loss",
    body: "Leveraged FX and metals trading can result in loss of capital, including loss greater than your deposit depending on your broker. Only trade money you can afford to lose.",
  },
  {
    title: "Tickets are plans, not promises",
    body: "A ticket is a published plan: direction, zone, stop, and optional targets. Markets gap. Spreads widen. Limits may not fill. A plan can fail even when followed exactly.",
  },
  {
    title: "Performance figures",
    body: "Pips, winrate, and closed ticket tables on this desk are not a live audited feed unless marked as such. Past results do not predict future results. Screenshots and ledger rows are not a guarantee.",
  },
  {
    title: "No account management",
    body: "We do not place trades for you, hold your funds, or act as a broker, advisor, or portfolio manager. Access plans (trial / VIP) buy visibility of tickets and support, not a managed result.",
  },
  {
    title: "Your obligations",
    body: "Read the full ticket before clicking. Size from entry-to-stop, not from targets. Honor the published invalidation. If you do not understand a plan, skip it.",
  },
];

export default function LegalPage() {
  return (
    <div className="min-h-full bg-[#050505] text-white">
      <section className="hero-wash px-6 pb-20 pt-[118px] md:pt-[132px]">
        <div className="relative z-10 mx-auto max-w-[1240px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
            Disclaimer
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
            Last updated {new Date().getFullYear()}. This page is a desk notice,
            not a substitute for counsel in your jurisdiction.
          </p>

          <div className="mt-10 space-y-3">
            {SECTIONS.map((item) => (
              <article
                key={item.title}
                className="rounded-[24px] bg-[#121212] p-6 ring-1 ring-white/[0.06]"
              >
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/50">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-[0.2em]">
            <Link href="/risk" className="text-[#E2B42A] hover:text-white">
              Risk rules
            </Link>
            <Link href="/support" className="text-[#E2B42A] hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
