import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fxssrwvztvlkopkbsqun.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4c3Nyd3Z6dHZsa29wa2JzcXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNTAxODksImV4cCI6MjA0NzgyNjE4OX0.c5U0vobJ66Qbb7xvtCu_4TIdAv_rBZTW7GndrUIWykE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
