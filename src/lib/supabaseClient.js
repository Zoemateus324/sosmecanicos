// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zxvaityvfynynfrttxlt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4dmFpdHl2ZnlueW5mcnR0eGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODAyNDksImV4cCI6MjA2MTI1NjI0OX0.EZMtSKzqsE-0ZyicuOQfwX3KjPmZ_RDqAer8nwkltmM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
