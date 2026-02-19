import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // We remove the NEXT_PUBLIC requirement by pointing directly 
  // to the names you defined in your .env and Github
  return createBrowserClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY! 
  )
}