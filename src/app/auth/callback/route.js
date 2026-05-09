import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  // あなたのサイトのURLを固定（末尾にスラッシュを入れない）
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

    // コードをセッションに交換
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 成功時：セットアップ画面へ強制連行
      return NextResponse.redirect(`${MY_SITE_URL}/picnic/setup`)
    }
  }

  // 失敗時：ログインページへ
  return NextResponse.redirect(`${MY_SITE_URL}/login?error=auth_failed`)
}