import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 安全策：値がない場合はここで止める
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabaseの環境変数が設定されていません。")
}

// 修正ポイント：よりシンプルでNext.jsと相性の良いインスタンス保持
// (windowに無理やり入れなくても、このファイルが一度読み込まれればキャッシュされます)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});