const RULES = [
  {
    title: "Read the plan first",
    body: "Direction, zone, SL and targets are one unit.",
  },
  {
    title: "Wait for the zone",
    body: "Do not chase a limit plan through the published band.",
  },
  {
    title: "Honor invalidation",
    body: "If SL prints, the idea is done.",
  },
] as const;

export function Rules() {
  return (
    <section className="px-6 pb-12">
      <div className="mx-auto max-w-[1240px]">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          Getting started
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {RULES.map((rule, index) => (
            <article
              key={rule.title}
              className="relative overflow-hidden rounded-[28px] bg-[#121212] p-7"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(80%_80%_at_20%_100%,rgba(226,180,42,0.16),transparent_70%)]"
              />
              <p className="text-[12px] font-medium text-[#E2B42A]">0{index + 1}</p>
              <p className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-white">
                {rule.title}
              </p>
              <p className="mt-3 text-[14px] leading-6 text-white/50">{rule.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
