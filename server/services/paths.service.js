const { supabase } = require("../config/database");

class PathsService {
  async getAllPaths() {
    const { data, error } = await supabase
      .from("roadmap_templates")
      .select("template_id, title, description, category, is_active")
      .eq("is_active", true);

    if (error) throw error;
    return data;
  }

  async getPathById(pathId) {
    // 1. Get Template (The Path)
    const { data: path, error: pathError } = await supabase
      .from("roadmap_templates")
      .select("*")
      .eq("template_id", pathId)
      .single();

    if (pathError) throw pathError;

    // 2. Get Skills (The Modules/Lessons)
    const { data: modules, error: modError } = await supabase
      .from("roadmap_skills")
      .select("*, Skills(skill_name, skill_category)")
      .eq("template_id", pathId)
      .order("sequence_order", { ascending: true });

    if (modError) throw modError;

    return { path, modules };
  }

  // The Critical Logic: Copies Template Data -> User Data
  async enrollPath(userId, pathId) {
    // 1. Check existing enrollment
    const { data: existing } = await supabase
      .from("user_roadmaps")
      .select("user_roadmap_id")
      .eq("user_id", userId)
      .eq("template_id", pathId)
      .single();

    if (existing) throw new Error("Already enrolled in this path");

    // 2. Get Template Version
    const { data: template } = await supabase
      .from("roadmap_templates")
      .select("version")
      .eq("template_id", pathId)
      .single();

    // 3. Create the User Roadmap Container
    const { data: newRoadmap, error: enrollError } = await supabase
      .from("user_roadmaps")
      .insert([{
        user_id: userId,
        template_id: pathId,
        roadmap_version: template?.version || "v1",
        status: "in_progress",
        started_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (enrollError) throw enrollError;

    // 4. COPY Skills from Template to User's Progress Table
    const { data: templateSkills } = await supabase
      .from("roadmap_skills")
      .select("*")
      .eq("template_id", pathId);

    if (templateSkills && templateSkills.length > 0) {
      const userModules = templateSkills.map(skill => ({
        user_roadmap_id: newRoadmap.user_roadmap_id,
        skill_id: skill.skill_id,
        sequence_order: skill.sequence_order,
        status: "not_started",
        module_name: skill.module_name || "Lesson Content",
        created_at: new Date().toISOString()
      }));

      // Bulk insert the copied skills
      const { error: copyError } = await supabase
        .from("user_roadmap_modules")
        .insert(userModules);
        
      if (copyError) console.error("Error copying modules:", copyError);
    }

    return newRoadmap;
  }
}

module.exports = new PathsService();