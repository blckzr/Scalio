const db = require('../config/database');
const { supabaseAdmin } = require('../config/database');
const marketService = require('./market.service');
const logger = require('../utils/logger');

class CareerService {
  async getCareerInsights(userId) {
    try {
      // Get user's assessed skills
      const { data: userSkills, error: userError } = await db
        .from('user_skills')
        .select(`
          proficiency_level,
          Skills (
            skill_name,
            skill_category
          )
        `)
        .eq('user_id', userId);

      if (userError) throw userError;

      // Get top in-demand skills from market data
      const { data: topSkills, error: marketError } = await supabaseAdmin
        .from('skill_demand')
        .select(`
          demand_score,
          avg_salary,
          job_count,
          Skills!inner (
            skill_name
          )
        `)
        .order('demand_score', { ascending: false })
        .limit(10);

      if (marketError) throw marketError;

      // Transform to include skill_name at top level
      const topSkillsFormatted = topSkills?.map(s => ({
        skill_name: s.Skills?.skill_name,
        demand_score: s.demand_score,
        avg_salary: s.avg_salary,
        job_postings_count: s.job_count
      })) || [];

      // Identify skills user has that are in high demand
      const userSkillNames = userSkills.map(us => us.Skills?.skill_name?.toLowerCase());
      const inDemandUserSkills = topSkillsFormatted.filter(ts => 
        userSkillNames.includes(ts.skill_name.toLowerCase())
      );

      // Identify skills user should learn (high demand, but user doesn't have)
      const skillsToLearn = topSkillsFormatted
        .filter(ts => !userSkillNames.includes(ts.skill_name.toLowerCase()))
        .slice(0, 5);

      // Calculate user's market readiness score
      const marketReadinessScore = this.calculateMarketReadiness(userSkills, topSkillsFormatted);

      // Recommend career paths based on skills
      const careerPaths = this.recommendCareerPaths(userSkills, topSkillsFormatted);

      logger.info(`Generated career insights for user ${userId}`);

      return {
        user_skills_count: userSkills.length,
        high_demand_skills_owned: inDemandUserSkills.length,
        market_readiness_score: marketReadinessScore,
        top_market_skills: topSkillsFormatted.slice(0, 5),
        your_in_demand_skills: inDemandUserSkills,
        skills_to_learn: skillsToLearn,
        recommended_career_paths: careerPaths
      };
    } catch (error) {
      logger.error(`Error generating career insights for user ${userId}:`, error);
      throw error;
    }
  }

  async predictSalary(userId) {
    try {
      // Get user's skills
      const { data: userSkills, error } = await db
        .from('user_skills')
        .select(`
          proficiency_level,
          Skills (
            skill_name
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      if (!userSkills || userSkills.length === 0) {
        return {
          predicted_salary_min: 0,
          predicted_salary_max: 0,
          predicted_salary_avg: 0,
          confidence: 'low',
          message: 'No skills assessed yet. Complete a skill assessment first.'
        };
      }

      // Get market data for user's skills
      const skillNames = userSkills.map(us => us.Skills?.skill_name);
      const { data: skillMarketData, error: marketError } = await supabaseAdmin
        .from('skill_demand')
        .select(`
          avg_salary,
          demand_score,
          Skills!inner (
            skill_name
          )
        `)
        .in('Skills.skill_name', skillNames);

      if (marketError) throw marketError;

      // Transform data
      const formattedMarketData = skillMarketData?.map(s => ({
        skill_name: s.Skills?.skill_name,
        avg_salary: s.avg_salary,
        demand_score: s.demand_score
      })) || [];

      // Calculate weighted average salary based on proficiency
      const proficiencyMultiplier = {
        'beginner': 0.7,
        'intermediate': 1.0,
        'advanced': 1.3
      };

      let totalWeightedSalary = 0;
      let totalWeight = 0;

      userSkills.forEach(us => {
        const skillName = us.Skills?.skill_name;
        const marketData = formattedMarketData?.find(s => s.skill_name === skillName);
        
        if (marketData && marketData.avg_salary) {
          const weight = proficiencyMultiplier[us.proficiency_level] || 1.0;
          totalWeightedSalary += marketData.avg_salary * weight;
          totalWeight += weight;
        }
      });

      const avgSalary = totalWeight > 0 ? Math.round(totalWeightedSalary / totalWeight) : 0;
      const minSalary = Math.round(avgSalary * 0.8);
      const maxSalary = Math.round(avgSalary * 1.2);

      // Determine confidence based on skill count and market data availability
      let confidence = 'low';
      if (userSkills.length >= 5 && formattedMarketData?.length >= 3) confidence = 'high';
      else if (userSkills.length >= 3 && formattedMarketData?.length >= 2) confidence = 'medium';

      logger.info(`Predicted salary for user ${userId}: $${avgSalary}`);

      return {
        predicted_salary_min: minSalary,
        predicted_salary_max: maxSalary,
        predicted_salary_avg: avgSalary,
        currency: 'USD',
        confidence: confidence,
        skills_analyzed: userSkills.length,
        market_data_available: formattedMarketData?.length || 0,
        breakdown: formattedMarketData?.map(s => ({
          skill: s.skill_name,
          market_avg_salary: s.avg_salary,
          demand_score: s.demand_score
        }))
      };
    } catch (error) {
      logger.error(`Error predicting salary for user ${userId}:`, error);
      throw error;
    }
  }

  async analyzeSkillGap(userId, targetRole = null) {
    try {
      // Get user's current skills
      const { data: userSkills, error: userError } = await db
        .from('user_skills')
        .select(`
          proficiency_level,
          Skills (
            skill_name,
            skill_category
          )
        `)
        .eq('user_id', userId);

      if (userError) throw userError;

      // Get top skills for target role (or general top skills)
      let targetSkills;
      if (targetRole) {
        targetSkills = await this.getSkillsForRole(targetRole);
      } else {
        // Get general high-demand skills
        const { data: topSkills, error: marketError } = await supabaseAdmin
          .from('skill_demand')
          .select(`
            demand_score,
            avg_salary,
            Skills!inner (
              skill_name
            )
          `)
          .order('demand_score', { ascending: false })
          .limit(15);

        if (marketError) throw marketError;
        targetSkills = topSkills?.map(s => ({
          skill_name: s.Skills?.skill_name,
          demand_score: s.demand_score,
          avg_salary: s.avg_salary
        })) || [];
      }

      // Identify gaps
      const userSkillNames = userSkills.map(us => us.Skills?.skill_name?.toLowerCase());
      
      const missingSkills = targetSkills.filter(ts => 
        !userSkillNames.includes(ts.skill_name.toLowerCase())
      );

      const existingSkills = targetSkills
        .filter(ts => userSkillNames.includes(ts.skill_name.toLowerCase()))
        .map(ts => {
          const userSkill = userSkills.find(us => 
            us.Skills?.skill_name?.toLowerCase() === ts.skill_name.toLowerCase()
          );
          return {
            skill_name: ts.skill_name,
            current_level: userSkill?.proficiency_level,
            demand_score: ts.demand_score,
            avg_salary: ts.avg_salary
          };
        });

      // Prioritize missing skills by demand
      const prioritizedGaps = missingSkills
        .sort((a, b) => (b.demand_score || 0) - (a.demand_score || 0))
        .slice(0, 10);

      // Calculate completion percentage
      const completionPercentage = targetSkills.length > 0 
        ? Math.round((existingSkills.length / targetSkills.length) * 100)
        : 0;

      logger.info(`Analyzed skill gap for user ${userId}. Completion: ${completionPercentage}%`);

      return {
        target_role: targetRole || 'General Tech Career',
        skills_required: targetSkills.length,
        skills_owned: existingSkills.length,
        skills_missing: missingSkills.length,
        completion_percentage: completionPercentage,
        existing_skills: existingSkills,
        skill_gaps: prioritizedGaps.map(s => ({
          skill_name: s.skill_name,
          demand_score: s.demand_score,
          avg_salary: s.avg_salary,
          priority: s.demand_score > 70 ? 'high' : s.demand_score > 40 ? 'medium' : 'low'
        })),
        recommendation: this.getGapRecommendation(completionPercentage, missingSkills.length)
      };
    } catch (error) {
      logger.error(`Error analyzing skill gap for user ${userId}:`, error);
      throw error;
    }
  }

  calculateMarketReadiness(userSkills, topMarketSkills) {
    if (!userSkills || userSkills.length === 0) return 0;

    const topSkillNames = topMarketSkills.slice(0, 10).map(s => s.skill_name.toLowerCase());
    const userSkillNames = userSkills.map(us => us.Skills?.skill_name?.toLowerCase());

    // Count how many top market skills the user has
    const matchCount = userSkillNames.filter(name => topSkillNames.includes(name)).length;

    // Factor in proficiency levels
    const avgProficiency = userSkills.reduce((sum, us) => {
      const score = { beginner: 1, intermediate: 2, advanced: 3 }[us.proficiency_level] || 1;
      return sum + score;
    }, 0) / userSkills.length;

    // Score: 50% for matching skills, 50% for proficiency
    const matchScore = (matchCount / 10) * 50;
    const proficiencyScore = ((avgProficiency - 1) / 2) * 50;

    return Math.round(matchScore + proficiencyScore);
  }

  recommendCareerPaths(userSkills, topMarketSkills) {
    const skillNames = userSkills.map(us => us.Skills?.skill_name?.toLowerCase());
    const paths = [];

    // Frontend Developer
    if (skillNames.some(s => ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css'].includes(s))) {
      paths.push({
        role: 'Frontend Developer',
        match_percentage: 75,
        avg_salary: 95000,
        job_demand: 'High'
      });
    }

    // Backend Developer
    if (skillNames.some(s => ['node', 'python', 'java', 'express', 'django', 'spring'].includes(s))) {
      paths.push({
        role: 'Backend Developer',
        match_percentage: 80,
        avg_salary: 105000,
        job_demand: 'Very High'
      });
    }

    // Full Stack Developer
    if (skillNames.some(s => ['react', 'node', 'javascript'].includes(s)) && userSkills.length >= 4) {
      paths.push({
        role: 'Full Stack Developer',
        match_percentage: 70,
        avg_salary: 110000,
        job_demand: 'Very High'
      });
    }

    // Data Scientist
    if (skillNames.some(s => ['python', 'machine learning', 'pandas', 'tensorflow', 'data science'].includes(s))) {
      paths.push({
        role: 'Data Scientist',
        match_percentage: 65,
        avg_salary: 120000,
        job_demand: 'High'
      });
    }

    // DevOps Engineer
    if (skillNames.some(s => ['docker', 'kubernetes', 'aws', 'terraform', 'jenkins'].includes(s))) {
      paths.push({
        role: 'DevOps Engineer',
        match_percentage: 70,
        avg_salary: 115000,
        job_demand: 'High'
      });
    }

    // Default if no matches
    if (paths.length === 0) {
      paths.push({
        role: 'Web Developer',
        match_percentage: 50,
        avg_salary: 85000,
        job_demand: 'Medium'
      });
    }

    return paths.sort((a, b) => b.match_percentage - a.match_percentage).slice(0, 3);
  }

  /**
   * Helper: Get required skills for a specific role
   */
  async getSkillsForRole(role) {
    // Predefined skill sets for common roles
    const roleSkills = {
      'frontend developer': ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript', 'Vue', 'Angular'],
      'backend developer': ['Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'Express', 'Django'],
      'full stack developer': ['JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB', 'HTML', 'CSS'],
      'data scientist': ['Python', 'Machine Learning', 'Pandas', 'SQL', 'TensorFlow', 'Statistics'],
      'devops engineer': ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins', 'Linux']
    };

    const skills = roleSkills[role.toLowerCase()] || [];
    
    // Get market data for these skills
    const { data, error } = await supabaseAdmin
      .from('skill_demand')
      .select(`
        demand_score,
        avg_salary,
        Skills!inner (
          skill_name
        )
      `)
      .in('Skills.skill_name', skills);

    if (error) {
      logger.error('Error fetching skills for role:', error);
      return skills.map(s => ({ skill_name: s, demand_score: 50, avg_salary: 80000 }));
    }

    return data?.map(s => ({
      skill_name: s.Skills?.skill_name,
      demand_score: s.demand_score,
      avg_salary: s.avg_salary
    })) || [];
  }

  /**
   * Helper: Get recommendation based on skill gap analysis
   */
  getGapRecommendation(completionPercentage, gapCount) {
    if (completionPercentage >= 80) {
      return 'Excellent! You have most of the required skills. Focus on gaining practical experience and building projects.';
    } else if (completionPercentage >= 60) {
      return `Good progress! Focus on learning the ${gapCount} missing skills to become more competitive in the job market.`;
    } else if (completionPercentage >= 40) {
      return 'You\'re on the right track. Prioritize the high-demand skills from your gap list and create a learning roadmap.';
    } else {
      return 'Start by building a strong foundation. Focus on the top 3-5 high-priority skills and work through structured courses.';
    }
  }
}

module.exports = new CareerService();
