import { createClient } from '@supabase/supabase-js'

// .env.local に記載したURLとKeyを読み込みます
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// URLやKeyが設定されていない場合にエラーを出して教えてくれる安全策
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabaseの環境変数が設定されていません。.env.local ファイルを確認してください。")
}

// Supabaseクライアントを作成してエクスポート
export const supabase = createClient(supabaseUrl, supabaseKey)