import { NextResponse } from 'next/server';

export async function POST(req) {
  // OpenAIのimportを削除することで、環境変数のチェックを回避します
  return NextResponse.json({ 
    needsConversion: false, 
    suggestions: [],
    message: "OpenAI integration is currently disabled."
  });
}