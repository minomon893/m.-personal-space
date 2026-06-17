import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { label, interpretation, monsterKey } = await req.json();

    // OpenAIを呼び出さず、直接ダミーデータを返すことでビルドを成功させます
    const dummyResponse = {
      monsterDamage: 25,
      playerDamage: 5,
      monsterReaction: "（現在はAI機能がオフです）",
      effect: "なし"
    };

    return NextResponse.json({
      monsterDamage: Math.max(0, Number(dummyResponse.monsterDamage) || 0),
      playerDamage: Math.max(0, Number(dummyResponse.playerDamage) || 10),
      monsterReaction: dummyResponse.monsterReaction,
      effect: dummyResponse.effect || "なし"
    });

  } catch (error) {
    console.error("Evaluation Error:", error);
    return NextResponse.json({ 
      monsterDamage: 0, 
      playerDamage: 12, 
      monsterReaction: "ふん、そんな言葉遊びでは私を動かせないわ。",
      effect: "なし"
    });
  }
}