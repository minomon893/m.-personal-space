import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const { label, interpretation, monsterKey } = await req.json();

  const MONSTER_CONFIG = {
    witch: { name: "恋愛魔女リティ", context: "好きな人ができた！どうする？" },
    dragon: { name: "承認欲求ドラゴン", context: "SNSで炎上した！どうする？" },
    slime: { name: "自己否定スライム", context: "仕事で失敗した！どうする？" },
    blackhall: { name: "不安ブラックホールマン", context: "第一志望の面談！どうする？" },
    golem: { name: "完璧主義ゴーレム", context: "テスト勉強全然出来てない！どうする？" },
  };

  const monster = MONSTER_CONFIG[monsterKey] || { name: "謎のモンスター", context: "何か悩みがあるようです。" };

  const prompt = `
    あなたはモンスター「${monster.name}」です。
    課題: "${monster.context}"
    プレイヤーが特性「${label}」を以下の解釈でぶつけました: "${interpretation || "（なし）"}"

    【判定基準とダメージルール】
    1. 【雑・無意味】解釈が短すぎる、または内容が不十分：
       - モンスターへのダメージ: 0
       - プレイヤーへのダメージ: 15
       - セリフ: 「そんな適当な言葉で私を倒せると思っているの？もっとちゃんと向き合ってよ。」
    
    2. 【ネガティブな障壁】特性を単なる言い訳やマイナス要素として扱っている：
       - モンスターへのダメージ: 5
       - プレイヤーへのダメージ: 20
       - セリフ: 「君のそのネガティブな言い訳、聞いていて反吐が出るよ。そんな思考のままじゃ何も変わらないわ。」
    
    3. 【リフレーミング成功】特性を前向きな武器として解釈し直している：
       - モンスターへのダメージ: 40〜60（解釈の鋭さに応じて変動）
       - プレイヤーへのダメージ: 0
       - セリフ: 「…なるほど、そういう考え方もあったのか。悔しいけど、その解釈には一本取られたわ。」

    【出力形式（厳守）】
    必ず以下のJSON形式で返してください。
    {
      "monsterDamage": 数値,
      "playerDamage": 数値,
      "monsterReaction": "モンスターのセリフ（プレイヤーを煽りつつ、次へのヒントになる内容）",
      "evaluation": "AI内部用の短い判定理由"
    }
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    return NextResponse.json({ error: "評価に失敗しました" }, { status: 500 });
  }
}