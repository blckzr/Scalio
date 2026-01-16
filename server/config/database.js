const { createClient } = require("@supabase/supabase-js")
require("dotenv").config()

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("Missing Supabase environment variables. Check your .env file.")
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
})

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Export as default for database queries
module.exports = supabase;

// Named exports for when you need both
module.exports.supabase = supabase;
module.exports.supabaseAdmin = supabaseAdmin;
