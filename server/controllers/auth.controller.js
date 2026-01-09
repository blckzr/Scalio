const { supabase } = require("../config/database");
const userService = require("../services/user.service");
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5000";

class AuthController {
  static async signUp(req, res) {
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        middle_name,
        birthday,
        contact_number,
      } = req.body;

      // Validation
      if (!email || !password || !first_name || !last_name) {
        return res
          .status(400)
          .json({
            message:
              "All required fields (Name, Email, Password) must be provided.",
          });
      }

      // Send data to Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name,
            last_name,
            middle_name: middle_name || null,
            birthday: birthday || null,
            contact_number: contact_number || null,
            role: "user",
          },
        },
      });

      if (error) return res.status(400).json({ message: error.message });

      // SUCCESS RESPONSE
      res.status(200).json({
        status: "success",
        message: "User created successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // 2. Sign In
  static async signIn(req, res) {
    try {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session)
        return res.status(401).json({ message: "Invalid credentials" });

      const userProfile = await userService.getUserById(data.user.id);

      res.status(200).json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: userProfile?.role || "user",
          firstName: userProfile?.first_name || "",
          lastName: userProfile?.last_name || "",
          middleName: userProfile?.middle_name || "",
          contactNumber: userProfile?.contact_number || "",
          birthday: userProfile?.birthday || null,
          isConfirmed: data.user.aud === "authenticated",
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // 3. Resend Verification Email
  static async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${CLIENT_URL}/auth/callback` },
      });
      if (error) return res.status(400).json({ message: error.message });
      res.status(200).json({ message: "Verification email resent." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // 4. Forgot Password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${CLIENT_URL}/reset-password`,
      });
      if (error) return res.status(400).json({ message: error.message });
      res.status(200).json({ message: "Password reset email sent." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // 5. Reset Password
  static async resetPassword(req, res) {
    try {
      const { access_token, newPassword } = req.body;
      if (!access_token || !newPassword)
        return res.status(400).json({ message: "Missing data" });
      const { error } = await supabase.auth.updateUser(
        { password: newPassword },
        { accessToken: access_token }
      );
      if (error) return res.status(400).json({ message: error.message });
      res.status(200).json({ message: "Password updated successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // 6. Get Current User
  static async getCurrentUser(req, res) {
    try {
      const user = req.user;
      const userProfile = await userService.getUserById(user.id);
      res
        .status(200)
        .json({ user: { id: user.id, email: user.email, ...userProfile } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // 7. Refresh Token
  static async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token)
        return res.status(400).json({ message: "Refresh token is required" });
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token,
      });
      if (error || !data.session)
        return res.status(401).json({ message: "Failed to refresh token" });
      res
        .status(200)
        .json({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // 8. Logout
  static async logout(req, res) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return res.status(400).json({ message: error.message });
      res.status(200).json({ message: "Logout successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = { AuthController };
