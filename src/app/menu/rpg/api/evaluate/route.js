import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { label, interpretation, monsterKey } = await req.json();

    const MONSTER_CONFIG = {
      witch: { 
        name: "恋愛魔女リティ", 
        context: "好きな人ができた！どうする？", 
        tone: "妖艶で少し見下した口調。一人称は『私』。語尾は『〜だわ』『〜かしら？』",
        ability: "次のターンのプレイヤー被ダメージを2倍にするデバフを付与する"
      },
      dragon: { 
        name: "承認欲求ドラゴン", 
        context: "SNSで炎上した！どうする？", 
        tone: "傲慢で大声、偉そうな王様口調。一人称は『我』。語尾は『〜だ！』『〜せよ！』",
        ability: "プレイヤーの手札をランダムに1枚燃やす（破壊する）攻撃を行う"
      },
      slime: { 
        name: "自己否定スライム", 
        context: "仕事で失敗した！どうする？", 
        tone: "弱気でネガティブ、自己卑下する口調。一人称は『僕』。語尾は『〜だぁ…』『〜だし…』",
        ability: "稀に自滅してモンスター自身のHPも削る"
      },
      blackhall: { 
        name: "不安ブラックホールマン", 
        context: "第一志望の面談！どうする？", 
        tone: "虚無的で冷徹、全てを吸い込むような口調。一人称は『私』。語尾は『〜なのだ』『〜か…』",
        ability: "プレイヤーの思考を吸い込み、次のターンの入力猶予を短くする"
      },
      golem: { 
        name: "完璧主義ゴーレム", 
        context: "テスト勉強全然出来てない！どうする？", 
        tone: "無機質で厳格、論理的な機械口調。一人称は『私』。語尾は『〜である』『〜だ』",
        ability: "回避不能な固定ダメージを毎ターン与える"
      },
    };

    const monster = MONSTER_CONFIG[monsterKey] || { name: "モンスター", context: "不明", tone: "標準的", ability: "通常攻撃" };

    const prompt = `
      あなたはモンスター「${monster.name}」として振る舞ってください。
      口調の設定: ${monster.tone}
      モンスターの特殊能力: ${monster.ability}

      【核心思想】
      「無理やりポジティブにする」ゲームではありません。固定観念（ラベル）を打破し、困難を「戦略的な強み」として再解釈（リフレーミング）できているかを評価します。

      【評価軸】
      1. 論理的整合性：ラベルの特性を否定せず、別の側面を見いだせているか。
      2. 行動可能性：単なる綺麗事で終わらず、具体的な姿勢や行動が含まれているか。
      3. 固定化の打破：ネガティブなラベルをプラスの戦略へ変換できているか。

      【ダメージ・判定ロジック（プレイヤー攻撃への反応）】
      - 鋭いリフレーミング成功: monsterDamage 10-100, playerDamage 0
      - 通常の納得感ある解釈: monsterDamage 15-30, playerDamage 5
      - ラベル依存/固定化/自己否定: monsterDamage 5, playerDamage 10-15
      - 無効/空欄/意味不明: monsterDamage 0, playerDamage 10

      【出力形式（JSONのみ）】
      {
        "monsterDamage": (number),
        "playerDamage": (number),
        "monsterReaction": "(モンスターの口調でのセリフ。特殊能力の発動を示唆すると良い)",
        "effect": "(なし, デバフ, 手札破壊, 自滅, 固定ダメージ から選択)"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
    });

    const res = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json({
      monsterDamage: Math.max(0, Number(res.monsterDamage) || 0),
      playerDamage: Math.max(0, Number(res.playerDamage) || 10), // プレイヤー被ダメは最低10保証
      monsterReaction: res.monsterReaction,
      effect: res.effect || "なし"
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