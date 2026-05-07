import { createBrowserClient } from "@supabase/ssr";

// これまでのページ（import { supabase } from "@/lib/supabase"）が
// そのまま動くように、最新の道具をエクスポートします。
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);