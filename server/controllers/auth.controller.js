const { supabase, supabaseAdmin } = require("../config/supabaseClient");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5000";

class AuthController {

  static async signUp(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${CLIENT_URL}/auth/callback` },
      });

      if (error) return res.status(400).json({ message: error.message });

      const userId = data.user?.id;

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({ user_id: userId, email });

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return res.status(500).json({ message: profileError.message });
      }

      res.status(200).json({ message: "Signup successful. Please verify your email." });

    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async signIn(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        return res.status(400).json({ message: "Email and password are required" });

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.session)
        return res.status(401).json({ message: "Invalid credentials" });

      res.status(200).json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: data.session.user,
      });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body;

      if (!email)
        return res.status(400).json({ message: "Email is required" });

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${CLIENT_URL}/auth/callback` },
      });

      if (error) return res.status(400).json({ message: error.message });

      res.status(200).json({ message: "Verification email resent." });

    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async forgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email)
        return res.status(400).json({ message: "Email is required" });

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${CLIENT_URL}/reset-password`,
        });

        if (error)
        return res.status(400).json({ message: error.message });

        res.status(200).json({ message: "Password reset email sent." });

    } catch (err) {
    res.status(500).json({ message: "Internal server error" });
    }
  }

static async resetPassword(req, res) {
    try {
        const { access_token, newPassword } = req.body;

        if (!access_token || !newPassword)
        return res.status(400).json({ message: "Missing data" });

        const { error } = await supabase.auth.updateUser(
        { password: newPassword },
        { accessToken: access_token }
        );

        if (error)
        return res.status(400).json({ message: error.message });

        res.status(200).json({ message: "Password updated successfully." });

    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = { AuthController };
