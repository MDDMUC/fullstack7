// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.https://sbygogkgwthgdzomaqgz.supabase.co
const supabaseAnonKey = process.env.sb_publishable_fJaa6WcXWxue0btGu0IAXA_CLCF2GSI

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
