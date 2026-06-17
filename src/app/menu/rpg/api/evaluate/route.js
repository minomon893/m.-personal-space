import { NextResponse } from 'next/server';
// import OpenAI from 'openai'; // ビルドエラー回避のためコメントアウト

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export async function POST(req) {
  try {
    // 実際にはAPIを叩かないため、リクエストの中身だけ受け取ります
    const { label, interpretation, monsterKey } = await req.json();

    // --- 以下、OpenAIの呼び出し部分をコメントアウト ---
    /*
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
    });
    const res = JSON.parse(completion.choices[0].message.content);
    */

    // APIの代わりに、開発中に動作確認するためのダミーデータを返します
    const dummyResponse = {
      monsterDamage: 25,
      playerDamage: 5,
      monsterReaction: "（現在はAI機能がオフです。実装を完了させてください）",
      effect: "なし"
    };

    return NextResponse.json({
      monsterDamage: Math.max(0, Number(dummyResponse.monsterDamage) || 0),
      playerDamage: Math.max(0, Number(dummyResponse.playerDamage) || 10),
      monsterReaction: dummyResponse.monsterReaction,
      effect: dummyResponse.effect || "なし"
    });

  } catch (error) {
    console.error("AI Evaluation Error:", error);
    return NextResponse.json({ 
      monsterDamage: 0, 
      playerDamage: 12, 
      monsterReaction: "ふん、そんな言葉遊びでは私を動かせないわ。",
      effect: "なし"
    });
  }
}