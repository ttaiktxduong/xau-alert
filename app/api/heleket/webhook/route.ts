import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  // Ưu tiên dùng Service Role Key để có quyền cập nhật profiles của user từ webhook
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    let payload: Record<string, any> = {};
    try {
      payload = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.info("[Heleket Webhook] Received payload:", payload);

    // Heleket gửi trạng thái thanh toán thành công (thường là status === 'paid' / 'success' hoặc state === 0)
    const isPaid =
      payload.status === "paid" ||
      payload.status === "success" ||
      payload.status === "completed" ||
      payload.state === 0;

    if (!isPaid) {
      console.warn("[Heleket Webhook] Order not paid or ignored:", payload.status || payload.state);
      return NextResponse.json({ ok: true, message: "Ignored status" });
    }

    const orderId = String(payload.order_id || "");
    const email = String(
      payload.payer_email || payload.email || payload.customer_email || ""
    ).trim().toLowerCase();

    if (!email) {
      console.error("[Heleket Webhook] Missing payer email in payload");
      return NextResponse.json({ error: "Missing payer email" }, { status: 400 });
    }

    // Xác định gói dựa trên orderId (vd: xau_vip_... hoặc xau_trial_...)
    const isVipMonth = orderId.includes("vip");
    const plan = isVipMonth ? "vip" : "trial";
    const days = isVipMonth ? 30 : 7;

    const sb = getAdminSupabase();
    if (!sb) {
      console.error("[Heleket Webhook] Supabase admin client is not configured");
      return NextResponse.json(
        { error: "Database not configured on server" },
        { status: 500 }
      );
    }

    // 1. Kiểm tra tài khoản trong bảng profiles
    const { data: profile, error: profileErr } = await sb
      .from("profiles")
      .select("id, vip_expires_at, role")
      .eq("email", email)
      .maybeSingle();

    if (profileErr) {
      console.error("[Heleket Webhook] Error fetching profile:", profileErr);
    }

    // 2. Tính toán ngày hết hạn (cộng dồn nếu user vẫn đang còn hạn VIP)
    let baseTime = Date.now();
    if (profile?.vip_expires_at) {
      const existingTime = new Date(profile.vip_expires_at).getTime();
      if (existingTime > baseTime) {
        baseTime = existingTime;
      }
    }
    const newExpiresAt = new Date(
      baseTime + days * 24 * 60 * 60 * 1000
    ).toISOString();

    // 3. Cập nhật quyền VIP vào Supabase
    if (profile?.id) {
      const { error: updateErr } = await sb
        .from("profiles")
        .update({
          role: profile.role === "admin" ? "admin" : "vip",
          vip_plan: plan,
          vip_expires_at: newExpiresAt,
        })
        .eq("id", profile.id);

      if (updateErr) {
        console.error("[Heleket Webhook] Error updating profile:", updateErr);
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }
    } else {
      // Trường hợp user mua hàng với email nhưng chưa đăng nhập hoặc profile chưa tạo
      const { error: upsertErr } = await sb.from("profiles").upsert({
        email,
        name: email.split("@")[0],
        role: "vip",
        vip_plan: plan,
        vip_expires_at: newExpiresAt,
      });

      if (upsertErr) {
        console.error("[Heleket Webhook] Error upserting profile:", upsertErr);
      }
    }

    console.info(`[Heleket Webhook] Successfully activated VIP for ${email} until ${newExpiresAt}`);
    return NextResponse.json({ ok: true, activated: email, expiresAt: newExpiresAt });
  } catch (err: any) {
    console.error("[Heleket Webhook] Unexpected error:", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
