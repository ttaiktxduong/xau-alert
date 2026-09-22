import { createHash } from "crypto";

const ENDPOINT = "https://api.heleket.com/v1/payment";

export const CHECKOUT_PLANS = {
  trial: { name: "7-day trial", amount: "29", period: "7 days" },
  vip: { name: "Monthly VIP", amount: "89", period: "month" },
} as const;

export type CheckoutPlan = keyof typeof CHECKOUT_PLANS;

export function signHeleket(body: string, apiKey: string) {
  return createHash("md5")
    .update(Buffer.from(body).toString("base64") + apiKey)
    .digest("hex");
}

export async function createHeleketInvoice(input: {
  amount: string;
  orderId: string;
  email?: string;
  successUrl: string;
  returnUrl: string;
  callbackUrl: string;
}) {
  const merchant = process.env.HELEKET_MERCHANT_ID;
  const apiKey = process.env.HELEKET_PAYMENT_KEY;
  if (!merchant || !apiKey) {
    throw new Error("Heleket keys are missing on the server.");
  }

  const payload: Record<string, string> = {
    amount: input.amount,
    currency: "USD",
    order_id: input.orderId,
    url_success: input.successUrl,
    url_return: input.returnUrl,
    url_callback: input.callbackUrl,
  };
  if (input.email) payload.payer_email = input.email;

  const body = JSON.stringify(payload);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      merchant,
      sign: signHeleket(body, apiKey),
      "Content-Type": "application/json",
    },
    body,
  });
  const json = (await res.json()) as {
    state?: number;
    result?: { url?: string; uuid?: string; order_id?: string };
    message?: string;
  };
  if (!res.ok || json.state !== 0 || !json.result?.url) {
    throw new Error(json.message || "Heleket did not return a payment URL.");
  }
  return json.result;
}
