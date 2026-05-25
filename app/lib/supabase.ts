import { createClient } from '@supabase/supabase-js'

// Bypassing the .env file and giving Next.js the exact strings
const supabaseUrl = "https://vmyjjwqocrosplnylxft.supabase.co"
const supabaseAnonKey = "sb_publishable_ZYJhUCKWxnqNv_L0nARWtA_jCPIAFxO"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)