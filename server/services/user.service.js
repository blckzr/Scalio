const { createClient } = require("@supabase/supabase-js")

class UserService {
  constructor() {
    // Initialize with Service Role Key to bypass RLS
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }

  async getUserById(userId) {
    // FIX 1: Select 'user_id' instead of 'id', and query 'user_id'
    const { data, error } = await this.supabase
      .from("UserProfiles")
      .select("user_id, email, first_name, last_name, middle_name, birthday, contact_number, role") // Updated fields to match your actual columns
      .eq("user_id", userId) // <--- Changed from 'id' to 'user_id'
      .single()

    if (error) throw error
    return data
  }

  async getAllUsers() {
    // FIX 2: Select 'user_id' instead of 'id'
    const { data, error } = await this.supabase
      .from("UserProfiles")
      .select("user_id, email, first_name, last_name, role")
      // .order("created_at", { ascending: false }) // Note: Ensure you have a created_at column if you use this sort!
    
    if (error) throw error
    return data
  }

  async updateUser(userId, updates) {
    // FIX 3: Update where 'user_id' matches
    const { data, error } = await this.supabase
      .from("UserProfiles")
      .update(updates)
      .eq("user_id", userId) 
      .select()

    if (error) throw error
    return data
  }

  async deleteUser(userId) {
    // STEP 1: Delete from Supabase Auth (The Source of Truth)
    const { error: authError } = await this.supabase.auth.admin.deleteUser(userId)
    
    if (authError) throw authError

    // STEP 2: Manually delete profile (Safety net)
    const { error: dbError } = await this.supabase
      .from("UserProfiles")
      .delete()
      .eq("user_id", userId) // <--- Changed from 'id' to 'user_id'

    if (dbError) throw dbError

    return { message: "User deleted successfully" }
  }

  async getUserRole(userId) {
    const { data, error } = await this.supabase
      .from("UserProfiles")
      .select("role")
      .eq("user_id", userId) // <--- Changed from 'id' to 'user_id'
      .single()

    if (error) return null 
    return data?.role
  }
}

module.exports = new UserService()