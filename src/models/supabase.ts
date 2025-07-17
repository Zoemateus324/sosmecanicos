import { createClientComponentClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export const supabase = createClientComponentClient<Database>()
