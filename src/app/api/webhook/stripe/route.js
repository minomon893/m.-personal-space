import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook専用のSupabaseクライアント
// サービスロールキーを使用してRLS（セキュリティポリシー）をバイパスします
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
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 決済完了イベントをキャッチ
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // 1. Stripeからメールアドレスを取得
    const customerEmail = session.customer_details?.email;

    if (customerEmail) {
      console.log(`🔔 Payment received from: ${customerEmail}`);

      // 2. profilesテーブルから、このメールアドレスを持つユーザーのIDを取得
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", customerEmail)
        .single();

      if (profileError || !profile) {
        console.error("❌ User not found in profiles table for email:", customerEmail);
      } else {
        // 3. subscriptionsテーブルを更新（または新規作成）
        const { error: subError } = await supabaseAdmin
          .from("subscriptions")
          .upsert({ 
            user_id: profile.id, 
            status: "active",
            updated_at: new Date().toISOString() 
          });

        if (subError) {
          console.error("❌ DB Update Error:", subError.message);
        } else {
          console.log(`✅ Successfully activated subscription for user: ${profile.id}`);
        }
      }
    } else {
      console.error("❌ No customer email found in Stripe session.");
    }
  }

  return NextResponse.json({ received: true });
}