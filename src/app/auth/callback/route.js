import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  // request.urlから必要な情報を抽出
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // あなたのサイトのURLを確実に指定
  const MY_SITE_URL = "https://m-personal-space.vercel.app"

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // 認証コードをセッション（ログイン状態の鍵）に交換
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 成功時：絶対パスでセットアップ画面へ強制リダイレクト
      // キャッシュを避けるため、NextResponse.redirect を直接 MY_SITE_URL で叩きます
      return NextResponse.redirect(`${MY_SITE_URL}/picnic/setup`)
    } else {
      console.error("Auth Exchange Error:", error)
    }
  }

  // 失敗時、またはコードがない場合はログインページへ
  return NextResponse.redirect(`${MY_SITE_URL}/login?error=auth_failed`)
}