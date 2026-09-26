"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function RedirectInner() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    const plan = params.get("plan") === "trial" ? "trial" : "vip";
    router.replace(`/checkout?plan=${plan}`);
  }, [params, router]);
  return (
    <div className="bg-[#050505] px-6 pb-20 pt-[118px] text-sm text-white/40">
      Loading…
    </div>
  );
}

export default function CheckoutDemoPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#050505] px-6 pb-20 pt-[118px] text-sm text-white/40">
          Loading…
        </div>
      }
    >
      <RedirectInner />
    </Suspense>
  );
}
