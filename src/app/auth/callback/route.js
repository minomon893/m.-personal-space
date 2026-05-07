import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  // メールリンクに含まれる「code」を取得
  const code = searchParams.get('code')

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

    // 「code」を使って正式にログインセッションを開始する
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // ログイン成功したらトップページへ
      return NextResponse.redirect(origin)
    }
  }

  // エラーが起きた場合はログインページへ戻す、またはエラーページへ
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}