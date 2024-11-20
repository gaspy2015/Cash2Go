// import { createClient } from '@supabase/supabase-js'
const {createClient} = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON)

module.exports = supabaseClient