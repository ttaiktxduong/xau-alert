import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  console.info("Heleket webhook", payload);
  return NextResponse.json({ ok: true });
}
