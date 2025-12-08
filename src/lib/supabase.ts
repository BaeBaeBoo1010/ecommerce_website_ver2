import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Missing Supabase public environment variables");
}

if (!supabaseServiceRoleKey) {
  console.warn("⚠️ Warning: SUPABASE_SERVICE_ROLE_KEY is missing (admin client disabled)");
}

/* ----------------------------------------
   🔹 Public Supabase Client
   - Safe for client + server
   - Uses anon key
----------------------------------------- */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

/* ----------------------------------------
   🔹 Admin Supabase Client
   - Server-only
   - Bypass RLS
   - Never expose to client!
----------------------------------------- */
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  })
  : null;
