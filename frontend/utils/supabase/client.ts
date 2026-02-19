import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // We remove the NEXT_PUBLIC requirement by pointing directly 
  // to the names you defined in your .env and Github
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
  )
}