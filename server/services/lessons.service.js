const { supabaseAdmin } = require("../config/database");
const UserRoadmap = require("../models/UserRoadmap.model"); // Ensure filename matches!

class LessonsService {
  
  // A. FETCH LIST (Lightweight)
  async getLessonsByRoadmap(userRoadmapId) {
    return await UserRoadmap.getModules(userRoadmapId);
  }

  // B. FETCH DETAIL (Heavy - Includes Resources)
  async getLessonById(lessonId) {
    try {
      // 1. Get Module Info + Skill Name
      const { data: moduleData, error: moduleError } = await supabaseAdmin
        .from("user_roadmap_modules")
        .select(`
          *,
          Skills (skill_name, skill_category)
        `)
        .eq("module_id", lessonId)
        .single();

      if (moduleError || !moduleData) {
        throw new Error("Module not found");
      }

      // 2. Get Resources linked to this Skill
      // This is the CRITICAL STEP that makes your content work
      const { data: resources, error: resourceError } = await supabaseAdmin
        .from("learning_resources")
        .select("*")
        .eq("skill_id", moduleData.skill_id);

      return { 
        ...moduleData, 
        resources: resources || [] 
      };

    } catch (error) {
      console.error("Error fetching lesson details:", error);
      throw error;
    }
  }

  // C. NAVIGATE (Find next lesson)
  async getNextLesson(lessonId) {
    try {
      const { data: current } = await supabaseAdmin
        .from("user_roadmap_modules")
        .select("user_roadmap_id, sequence_order")
        .eq("module_id", lessonId)
        .single();

      if (!current) return null;

      const { data } = await supabaseAdmin
        .from("user_roadmap_modules")
        .select("module_id")
        .eq("user_roadmap_id", current.user_roadmap_id)
        .gt("sequence_order", current.sequence_order)
        .order("sequence_order", { ascending: true })
        .limit(1)
        .single();

      return data;
    } catch (error) {
      return null;
    }
  }
}

module.exports = LessonsService;