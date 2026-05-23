import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { labels } = await req.json();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: `
      入力されたラベルリストを分析してください。ADHD, ASD, HSP, INFPなどの診断名・分類名が含まれる場合、それをゲーム的な性質（例:「発想が飛びやすい」「刺激に敏感」）に変換する提案をしてください。
      JSON形式で返してください: { "needsConversion": boolean, "suggestions": [{ "index": number, "original": string, "options": string[] }] }
    ` }, { role: "user", content: JSON.stringify(labels) }],
    response_format: { type: "json_object" },
  });
  return NextResponse.json(JSON.parse(completion.choices[0].message.content));
}