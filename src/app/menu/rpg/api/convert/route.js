import { NextResponse } from 'next/server';
// import OpenAI from 'openai'; // OpenAIライブラリのインポートをコメントアウト

// OpenAIのインスタンス化をコメントアウト（または削除）
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  // 現在この機能は無効化されているため、APIキーが不要なレスポンスを返すようにしています
  return NextResponse.json({ 
    needsConversion: false, 
    suggestions: [],
    message: "OpenAI integration is currently disabled."
  });
}