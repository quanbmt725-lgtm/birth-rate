import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjckzvmdmtkhsqrydfjp.supabase.co'
const supabaseKey = 'sb_publishable_InbCy6mJD4Mo12ujqYrzgA_d2VGapgS'

export const supabase = createClient(supabaseUrl, supabaseKey)