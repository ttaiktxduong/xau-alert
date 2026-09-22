import { SupportForm } from "../components/support/SupportForm";

export default function SupportPage() {
  return (
    <div className="bg-[#050505] text-white">
      <section className="hero-wash px-6 pb-20 pt-[118px] md:pt-[132px]">
        <div className="relative z-10 mx-auto max-w-[1240px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Desk
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
            Support
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
            Ticket questions, billing, and access. We do not give personal trade
            advice on this page.
          </p>

          <div className="mt-10 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <article className="relative h-fit overflow-hidden rounded-[28px] bg-[#121212] p-7 ring-1 ring-white/[0.06]">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -bottom-16 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(226,180,42,0.2),transparent_68%)]"
              />
              <p className="relative text-[11px] font-bold uppercase tracking-[0.16em] text-[#E2B42A]">
                Email
              </p>
              <p className="relative mt-3 text-[18px] font-medium text-white">
                desk@xaualert.local
              </p>
              <p className="relative mt-2 text-sm leading-6 text-white/45">
                Placeholder — swap later.
              </p>
            </article>

            <SupportForm />
          </div>
        </div>
      </section>
    </div>
  );
}
