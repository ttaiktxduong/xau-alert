import Image from "next/image";
import Link from "next/link";

const DESK = [
  { href: "/signals", label: "Live Signals" },
  { href: "/performance", label: "Performance" },
  { href: "/risk", label: "Risk" },
] as const;

const LEGAL = [
  { href: "/support", label: "Contact" },
  { href: "/legal", label: "Disclaimer" },
] as const;

export function Footer() {
  return (
    <footer className="relative z-10 bg-[#050505]">
      <div className="h-[2px] w-full bg-[#E2B42A]" />
      <div className="mx-auto grid max-w-[1240px] gap-12 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo-xau.jpg"
              alt="XAU Alert"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-contain"
            />
            <span className="flex items-baseline gap-1.5">
              <span className="text-[17px] font-semibold tracking-wide text-white">XAU</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E2B42A]">
                Alert
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/45">
            XAUUSD signals issued as trade tickets. Not financial advice.
          </p>
        </div>

        <div>
          <p className="text-[12px] font-medium text-[#E2B42A]">Desk</p>
          <ul className="mt-4 space-y-2.5">
            {DESK.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-white/50 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[12px] font-medium text-[#E2B42A]">Legal</p>
          <ul className="mt-4 space-y-2.5">
            {LEGAL.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-white/50 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/8">
        <p className="mx-auto max-w-[1240px] px-6 py-5 text-[12px] text-white/35">
          © {new Date().getFullYear()} XAU Desk · Not financial advice
        </p>
      </div>
    </footer>
  );
}

export default Footer;
