const { supabase } = require("../config/database");

class LessonsService {
  // Get all user lessons for a specific Roadmap
  async getLessonsByRoadmap(userRoadmapId) {
    const { data, error } = await supabase
      .from("user_roadmap_modules")
      .select("*, Skills(skill_name, skill_category)")
      .eq("user_roadmap_id", userRoadmapId)
      .order("sequence_order", { ascending: true });

    if (error) throw error;
    return data;
  }

  async getLessonById(lessonId) {
    // Note: In your schema, 'module_id' is the Primary Key of user_roadmap_modules
    const { data, error } = await supabase
      .from("user_roadmap_modules")
      .select("*, Skills(skill_name, skill_category)")
      .eq("module_id", lessonId)
      .single();

    if (error) throw error;
    return data;
  }

  async getNextLesson(lessonId) {
    // 1. Get current lesson position
    const { data: current, error: currError } = await supabase
      .from("user_roadmap_modules")
      .select("user_roadmap_id, sequence_order")
      .eq("module_id", lessonId)
      .single();

    if (currError) throw currError;

    // 2. Find next lesson in the same roadmap
    const { data, error } = await supabase
      .from("user_roadmap_modules")
      .select("*")
      .eq("user_roadmap_id", current.user_roadmap_id)
      .gt("sequence_order", current.sequence_order)
      .order("sequence_order", { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
    return data;
  }

  async markComplete(lessonId, { selfRating, notes }) {
    const { data, error } = await supabase
      .from("user_roadmap_modules")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        // notes: notes // Uncomment if you add a notes column to this table
      })
      .eq("module_id", lessonId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new LessonsService();