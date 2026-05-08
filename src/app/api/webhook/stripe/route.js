import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Webhook専用のSupabaseクライアント（サービスロールキーを使用して権限をバイパス）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 決済完了イベントをキャッチ
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // 決済時にログインしていたユーザーのIDをStripeから受け取る設定が必要
    // ※支払いリンクのメタデータ、または client_reference_id を使用
    const userId = session.client_reference_id;

    if (userId) {
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .upsert({ 
          user_id: userId, 
          status: "active",
          updated_at: new Date().toISOString() 
        });

      if (error) console.error("DB Update Error:", error);
    }
  }

  return NextResponse.json({ received: true });
}