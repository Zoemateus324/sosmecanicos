// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zxvaityvfynynfrttxlt.supabase.co'
const supabaseAnonKey = 'PUBLIC-ANON-KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
