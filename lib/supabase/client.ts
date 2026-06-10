import { createBrowserClient } from '@supabase/ssr'

// SPD Intel's tables live in the `spd` Postgres schema (this Supabase project is
// shared with other apps that own `public`). Pin every client to that schema.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: 'spd' } }
  )
}
