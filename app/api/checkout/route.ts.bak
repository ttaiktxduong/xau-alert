import { NextRequest, NextResponse } from "next/server";
import { CHECKOUT_PLANS, createHeleketInvoice, type CheckoutPlan } from "../../lib/heleket";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    plan?: CheckoutPlan;
    email?: string;
  } | null;
  const plan = body?.plan;
  if (!plan || !(plan in CHECKOUT_PLANS)) {
    return NextResponse.json({ error: "Choose a plan." }, { status: 400 });
  }

  const origin = req.headers.get("origin") || req.nextUrl.origin;
  const selected = CHECKOUT_PLANS[plan];
  const orderId = `xau_${plan}_${Date.now()}`;

  if (!process.env.HELEKET_MERCHANT_ID || !process.env.HELEKET_PAYMENT_KEY) {
    return NextResponse.json(
      { error: "Heleket is not configured. Add merchant ID and payment key." },
      { status: 503 },
    );
  }

  try {
    const invoice = await createHeleketInvoice({
      amount: selected.amount,
      orderId,
      email: body?.email,
      successUrl: `${origin}/account?paid=1&order=${orderId}`,
      returnUrl: `${origin}/#pricing`,
      callbackUrl: `${origin}/api/heleket/webhook`,
    });
    return NextResponse.json({ url: invoice.url, orderId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
