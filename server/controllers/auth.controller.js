const { supabase, supabaseAdmin } = require("../config/database")

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5000"

class AuthController {
  // 1. Sign Up (Updated to match your "Create Account" form)
  static async signUp(req, res) {
    try {
      // Extract all fields from the request body
      const { 
        email, 
        password, 
        first_name, 
        last_name, 
        middle_name, 
        birthday, 
        contact_number 
      } = req.body

      // Validation: Ensure the critical fields are present
      if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ message: "All required fields (Name, Email, Password) must be provided." })
      }

      // Send data to Supabase Auth
      // We pass the extra profile fields (birthday, phone, etc.) inside 'options.data'.
      // Your SQL Trigger in Supabase will need to grab these and save them to the 'UserProfiles' table.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${CLIENT_URL}/auth/callback`,
          data: {
            first_name,
            last_name,
            middle_name: middle_name || "",      // Optional: defaults to empty string if missing
            birthday: birthday || null,          // Optional: defaults to null
            contact_number: contact_number || "", // Optional: defaults to empty string
            role: 'user' // Default role
          }
        },
      })

      if (error) return res.status(400).json({ message: error.message })

      res.status(200).json({ message: "Signup successful. Please verify your email." })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }

  // 2. Sign In
  static async signIn(req, res) {
    try {
      const { email, password } = req.body

      if (!email || !password) return res.status(400).json({ message: "Email and password are required" })

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error || !data.session) return res.status(401).json({ message: "Invalid credentials" })

      // Fetch the user profile from 'UserProfiles' to send back with the token
      const { data: profile } = await supabase
        .from("UserProfiles")
        .select("*")
        .eq("user_id", data.user.id)
        .single()

      res.status(200).json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          ...data.user,
          profile: profile || null 
        },
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }

  // 3. Resend Verification Email
  static async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body

      if (!email) return res.status(400).json({ message: "Email is required" })

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${CLIENT_URL}/auth/callback` },
      })

      if (error) return res.status(400).json({ message: error.message })

      res.status(200).json({ message: "Verification email resent." })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }

  // 4. Forgot Password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body

      if (!email) return res.status(400).json({ message: "Email is required" })

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${CLIENT_URL}/reset-password`,
      })

      if (error) return res.status(400).json({ message: error.message })

      res.status(200).json({ message: "Password reset email sent." })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }

  // 5. Reset Password
  static async resetPassword(req, res) {
    try {
      const { access_token, newPassword } = req.body

      if (!access_token || !newPassword) return res.status(400).json({ message: "Missing data" })

      const { error } = await supabase.auth.updateUser(
        { password: newPassword }, 
        { accessToken: access_token }
      )

      if (error) return res.status(400).json({ message: error.message })

      res.status(200).json({ message: "Password updated successfully." })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }

  // 6. Get Current User (Protected)
  static async getCurrentUser(req, res) {
    try {
      // User is already verified by authMiddleware
      const user = req.user

      // Query 'UserProfiles' table
      const { data: profile, error } = await supabase
        .from("UserProfiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error) {
        return res.status(404).json({ message: "User profile not found" })
      }

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          ...profile, // Merges profile fields (first_name, role, etc.)
        },
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }

  // 7. Refresh Token
  static async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body

      if (!refresh_token) {
        return res.status(400).json({ message: "Refresh token is required" })
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token,
      })

      if (error || !data.session) {
        return res.status(401).json({ message: "Failed to refresh token" })
      }

      res.status(200).json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }

  // 8. Logout
  static async logout(req, res) {
    try {
      // Invalidate session on the backend (Supabase side)
      const { error } = await supabase.auth.signOut()

      if (error) {
        return res.status(400).json({ message: error.message })
      }

      res.status(200).json({ message: "Logout successful" })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }
}

module.exports = { AuthController }