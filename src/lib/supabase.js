import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// URLやKeyが設定されていない場合にエラーを出して教えてくれる安全策
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabaseの環境変数が設定されていません。.env.local ファイルを確認してください。")
}

// グローバル変数としてインスタンスを保持する（開発中の二重作成防止）
let supabaseClient;

if (typeof window !== "undefined" && window.supabaseInstance) {
  // すでにブラウザ上にインスタンスがある場合はそれを使う
  supabaseClient = window.supabaseInstance;
} else {
  // ない場合は新しく作成する
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });

  // ブラウザ環境であれば、作成したものをグローバルに保存しておく
  if (typeof window !== "undefined") {
    window.supabaseInstance = supabaseClient;
  }
}

export const supabase = supabaseClient;