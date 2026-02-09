const { supabase } = require("../config/database");

class StudySessionService {
  async logSession(userId, { milestoneId, resourceId, duration, notes, rating, technique }) {
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + duration * 60000).toISOString();

    const { data, error } = await supabase
      .from("Study_Sessions")
      .insert([{
        user_id: userId,
        milestone_id: milestoneId, // This maps to your "Lesson ID"
        resource_id: resourceId,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: duration,
        self_rating: rating,
        technique_used: technique,
        notes
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserHistory(userId) {
    const { data, error } = await supabase
      .from("Study_Sessions")
      .select("*")
      .eq("user_id", userId)
      .order("start_time", { ascending: false });

    if (error) throw error;
    return data;
  }

  async getStats(userId) {
    // Get total minutes from session history
    const { data: sessions, error } = await supabase
      .from("Study_Sessions")
      .select("duration_minutes")
      .eq("user_id", userId);

    if (error) throw error;

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

    return {
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60),
      totalSessions: sessions.length
    };
  }
}

module.exports = new StudySessionService();