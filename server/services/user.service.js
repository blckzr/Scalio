const { createClient } = require("@supabase/supabase-js")

class UserService {
  constructor() {
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
    const { data, error } = await this.supabase
      .from("UserProfiles")
      .select("user_id, email, first_name, last_name, middle_name, birthday, contact_number, role") // Updated fields to match your actual columns
      .eq("user_id", userId) 
      .single()

    if (error) throw error
    return data
  }

  async getAllUsers() {
    const { data, error } = await this.supabase
      .from("UserProfiles")
      .select("user_id, email, first_name, last_name, role")
    
    if (error) throw error
    return data
  }

  async updateUser(userId, updates) {
    const { data, error } = await this.supabase
      .from("UserProfiles")
      .update(updates)
      .eq("user_id", userId) 
      .select()

    if (error) throw error
    return data
  }

  async deleteUser(userId) {
    const { error: authError } = await this.supabase.auth.admin.deleteUser(userId)
    
    if (authError) throw authError

    const { error: dbError } = await this.supabase
      .from("UserProfiles")
      .delete()
      .eq("user_id", userId)

    if (dbError) throw dbError

    return { message: "User deleted successfully" }
  }

  async getUserRole(userId) {
    const { data, error } = await this.supabase
      .from("UserProfiles")
      .select("role")
      .eq("user_id", userId)
      .single()

    if (error) return null 
    return data?.role
  }
}

module.exports = new UserService()