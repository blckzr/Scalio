const { supabase } = require("../config/database");

class ProgressService {
  async getUserProgress(userId) {
    const { data, error } = await supabase
      .from("user_roadmaps")
      .select("user_roadmap_id, template_id, status, progress_percentage, roadmap_templates(title)")
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  }

  async getPathProgress(userId, pathId) {
    // 1. Get the specific Roadmap Instance
    const { data: roadmap, error: mapError } = await supabase
      .from("user_roadmaps")
      .select("user_roadmap_id, progress_percentage")
      .eq("user_id", userId)
      .eq("template_id", pathId)
      .single();

    if (mapError) throw mapError;

    // 2. Calculate Stats from Modules
    const { data: modules, error: modError } = await supabase
      .from("user_roadmap_modules")
      .select("status")
      .eq("user_roadmap_id", roadmap.user_roadmap_id);

    if (modError) throw modError;

    const completed = modules.filter(m => m.status === "completed").length;
    
    return {
      pathId,
      totalModules: modules.length,
      completedModules: completed,
      progressPercentage: roadmap.progress_percentage
    };
  }
}

module.exports = new ProgressService();