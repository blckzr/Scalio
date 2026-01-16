const db = require("../config/database")
const { supabaseAdmin } = require("../config/database")
const logger = require("../utils/logger")
const RoadmapTemplate = require("../models/RoadmapTemplate.model")

class AssessmentService {
  async submitSkillAssessment(userId, skillName, proficiencyLevel) {
    try {
      // Validate proficiency level
      const validLevels = ["beginner", "intermediate", "advanced"]
      if (!validLevels.includes(proficiencyLevel)) {
        throw new Error(`Invalid proficiency level. Must be one of: ${validLevels.join(", ")}`)
      }

      // Get or create skill (use admin client for Skills table)
      let { data: skill } = await supabaseAdmin
        .from("Skills")
        .select("skill_id, skill_name, skill_category")
        .ilike("skill_name", skillName)
        .single()

      if (!skill) {
        // Create new skill if it doesn't exist (admin only)
        const { data: newSkill, error: createError } = await supabaseAdmin
          .from("Skills")
          .insert({ skill_name: skillName, skill_category: "technical" })
          .select("skill_id, skill_name, skill_category")
          .single()

        if (createError) throw createError
        skill = newSkill
      }

      // Upsert user skill assessment
      const { data: userSkill, error: upsertError } = await db
        .from("user_skills")
        .upsert(
          {
            user_id: userId,
            skill_id: skill.skill_id,
            proficiency_level: proficiencyLevel,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,skill_id",
          },
        )
        .select("id, user_id, skill_id, proficiency_level, assessed_at, updated_at")
        .single()

      if (upsertError) throw upsertError

      logger.info(`User ${userId} assessed ${skillName} as ${proficiencyLevel}`)

      return {
        user_skill_id: userSkill.id,
        skill_id: skill.skill_id,
        skill_name: skill.skill_name,
        skill_category: skill.skill_category,
        proficiency_level: userSkill.proficiency_level,
        assessed_at: userSkill.assessed_at,
        updated_at: userSkill.updated_at,
      }
    } catch (error) {
      logger.error(`Error submitting skill assessment:`, error)
      throw error
    }
  }

  async getUserSkills(userId) {
    try {
      // STEP 1: Fetch the user's skill entries (IDs only)
      const { data: userSkills, error: usError } = await db
        .from("user_skills")
        .select("id, skill_id, proficiency_level, assessed_at, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })

      if (usError) throw usError
      
      // If user has no skills, return empty array immediately
      if (!userSkills || userSkills.length === 0) {
        return []
      }

      // STEP 2: Extract all skill IDs to fetch their names
      const skillIds = userSkills.map((us) => us.skill_id)

      // STEP 3: Fetch the names from the 'Skills' table manually
      // Note: We use 'supabaseAdmin' here to bypass any potential Row Level Security (RLS) issues
      const { data: skillsData, error: skillsError } = await supabaseAdmin
        .from("Skills") // Make sure this matches your table name exactly (Case Sensitive)
        .select("skill_id, skill_name, skill_category")
        .in("skill_id", skillIds)

      if (skillsError) throw skillsError

      // STEP 4: Merge the two lists together in JavaScript
      // Create a lookup map for faster matching: { "uuid": { name: "JS", cat: "Tech" } }
      const skillMap = {}
      skillsData.forEach((skill) => {
        skillMap[skill.skill_id] = skill
      })

      const mappedSkills = userSkills.map((us) => {
        const skillInfo = skillMap[us.skill_id] || {}
        
        return {
          user_skill_id: us.id,
          skill_id: us.skill_id,
          // Now we pull from our manual lookup map
          skill_name: skillInfo.skill_name || "Unknown Skill",
          skill_category: skillInfo.skill_category || "Uncategorized",
          proficiency_level: us.proficiency_level,
          assessed_at: us.assessed_at,
          updated_at: us.updated_at,
        }
      })

      return mappedSkills
    } catch (error) {
      logger.error(`Error getting user skills for user ${userId}:`, error)
      throw error
    }
  }

  async quickAssessment(userId, skills) {
    try {
      const results = []
      const errors = []

      for (const { skill, level } of skills) {
        try {
          const result = await this.submitSkillAssessment(userId, skill, level)
          results.push(result)
        } catch (error) {
          errors.push({ skill, error: error.message })
          logger.error(`Error assessing ${skill}:`, error)
        }
      }

      const levelScores = { beginner: 1, intermediate: 2, advanced: 3 }
      const avgScore = results.reduce((sum, r) => sum + levelScores[r.proficiency_level], 0) / (results.length || 1)

      let overall_level
      if (avgScore < 1.5) overall_level = "beginner"
      else if (avgScore < 2.5) overall_level = "intermediate"
      else overall_level = "advanced"

      const recommended_path = await this.determineRecommendedPath(results)

      logger.info(`User ${userId} completed quick assessment: ${results.length} skills assessed`)

      return {
        overall_level,
        skills_assessed: results.length,
        recommended_path: recommended_path ? recommended_path.title : "Web Developer",
        recommended_template_id: recommended_path ? recommended_path.template_id : null,
        assessments: results,
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      logger.error(`Error in quick assessment for user ${userId}:`, error)
      throw error
    }
  }

  async determineRecommendedPath(assessments) {
    const tags = assessments.map((a) => a.skill_name.toLowerCase())

    // Add proficiency levels to tags
    assessments.forEach((a) => {
      tags.push(a.proficiency_level.toLowerCase())
    })

    const bestMatch = await RoadmapTemplate.findBestMatch(tags)

    return bestMatch
  }

  async updateSkillAssessment(userId, skillId, proficiencyLevel) {
    try {
      const { data: updated, error } = await db
        .from("user_skills")
        .update({
          proficiency_level: proficiencyLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("skill_id", skillId)
        .select()
        .single()

      if (error) throw error

      logger.info(`User ${userId} updated skill ${skillId} to ${proficiencyLevel}`)
      return updated
    } catch (error) {
      logger.error(`Error updating skill assessment:`, error)
      throw error
    }
  }

  async deleteSkillAssessment(userId, skillId) {
    try {
      const { error } = await db.from("user_skills").delete().eq("user_id", userId).eq("skill_id", skillId)

      if (error) throw error

      logger.info(`User ${userId} deleted assessment for skill ${skillId}`)
      return { success: true }
    } catch (error) {
      logger.error(`Error deleting skill assessment:`, error)
      throw error
    }
  }
}

module.exports = new AssessmentService()
