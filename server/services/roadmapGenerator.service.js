const db = require('../config/database');
const logger = require('../utils/logger');
const userRoadmapService = require('./userRoadmap.service');
const aiService = require('./ai.service');

class RoadmapGeneratorService {
  async generateRoadmap({ user_id, learning_goal, current_skills = [], hours_per_week = 10, experience_level = 'beginner', use_ai = true }) {
    try {
      logger.info(`Generating roadmap for user ${user_id}`, {
        learning_goal,
        current_skills: current_skills.length,
        hours_per_week,
        experience_level,
        use_ai
      });

      if (use_ai) {
        return await this.generateAIRoadmap({
          user_id,
          learning_goal,
          current_skills,
          hours_per_week,
          experience_level
        });
      }

      return await this.generateTemplateRoadmap({
        user_id,
        learning_goal,
        current_skills,
        hours_per_week,
        experience_level
      });

    } catch (error) {
      logger.error('Roadmap generation failed', { error: error.message });
      throw error;
    }
  }

  async generateAIRoadmap({ user_id, learning_goal, current_skills, hours_per_week, experience_level }) {
    try {
      logger.info(`Generating AI-powered roadmap for ${learning_goal}`);

      const marketData = await this.getMarketData(learning_goal);

      const userProfile = await this.getUserProfile(user_id);

      const aiRoadmap = await aiService.complete(`You are an expert learning path advisor. Generate a comprehensive, personalized learning roadmap.

USER PROFILE:
- User ID: ${user_id}
- Learning Goal: ${learning_goal}
- Experience Level: ${experience_level}
- Available Study Time: ${hours_per_week} hours/week
- Current Skills: ${current_skills.length > 0 ? current_skills.join(', ') : 'None'}
- Profile Details: ${JSON.stringify(userProfile || {})}

${marketData ? `MARKET DATA (Philippines Job Market):
- High Demand Skills: ${marketData.high_demand_skills?.join(', ') || 'N/A'}
- Average Salary Range: ₱${marketData.avg_salary_min || 'N/A'} - ₱${marketData.avg_salary_max || 'N/A'}
- Job Postings: ${marketData.job_count || 'N/A'} active positions
- Trending Skills: ${marketData.trending_skills?.join(', ') || 'N/A'}` : ''}

TASK:
Generate a personalized learning roadmap with the following structure:

1. Analyze user's current level vs goal requirements
2. Create 4-6 learning phases: Foundation → Intermediate → Advanced → Specialization
3. For each phase include:
   - Phase name and clear description
   - 3-8 specific skills to learn (prioritize high-demand skills)
   - Realistic duration in weeks based on ${hours_per_week} hrs/week
   - 2-4 key milestones with hour estimates
   - 3-5 learning resources (courses, docs, projects)
4. SKIP skills user already knows: ${current_skills.join(', ')}
5. Include career outcomes and next steps

IMPORTANT GUIDELINES:
- Be realistic about time (don't overcrowd phases)
- Prioritize job-ready, practical skills
- Include hands-on projects in each phase
- Consider Philippine job market demand
- Total roadmap should be achievable in 3-12 months

Return ONLY valid JSON (no markdown, no explanations):
{
  "roadmap_title": "Personalized [Technology] Learning Path",
  "description": "Brief description of what user will learn",
  "total_duration_weeks": 24,
  "difficulty_level": "${experience_level}",
  "phases": [
    {
      "phase_number": 1,
      "phase_name": "Foundation Phase",
      "description": "Build core fundamentals",
      "duration_weeks": 6,
      "skills": ["skill1", "skill2", "skill3"],
      "milestones": [
        {
          "title": "Complete basics",
          "description": "Learn fundamental concepts",
          "estimated_hours": 20,
          "resources": ["Resource name", "Another resource"]
        }
      ],
      "learning_resources": [
        {
          "title": "Resource Title",
          "type": "course",
          "description": "What you'll learn",
          "url": "https://example.com",
          "priority": "high"
        }
      ]
    }
  ],
  "career_outcomes": ["Junior Developer", "Entry-level position"],
  "estimated_salary_range": "₱25,000 - ₱40,000",
  "next_steps": "After completion, you can...",
  "personalization_notes": "Customized based on your skills and market demand"
}`, {
        temperature: 0.7,
        parseJSON: true
      });

      logger.info(`AI generated roadmap with ${aiRoadmap.phases?.length} phases`);

      // Step 4: Save to database
      const template = await this.findBestMatchingTemplate(learning_goal);
      const userRoadmap = await userRoadmapService.createUserRoadmap(
        user_id,
        template?.template_id || null,
        template?.version || '1.0'
      );

      // Step 5: Return AI-generated roadmap
      return {
        user_roadmap_id: userRoadmap.user_roadmap_id,
        template_id: template?.template_id || null,
        ...aiRoadmap,
        personalization: {
          experience_level,
          skills_already_known: current_skills.length,
          market_data_included: !!marketData,
          ai_enhanced: true,
          generation_method: 'gemini-ai'
        },
        metadata: {
          generated_at: new Date().toISOString(),
          user_id,
          hours_per_week
        }
      };

    } catch (error) {
      logger.error('AI roadmap generation failed, falling back to template', { error: error.message });
      
      // Fallback to template-based if AI fails
      return await this.generateTemplateRoadmap({
        user_id,
        learning_goal,
        current_skills,
        hours_per_week,
        experience_level
      });
    }
  }

  
  async generateTemplateRoadmap({ user_id, learning_goal, current_skills, hours_per_week, experience_level }) {
    try {
      logger.info(`Generating template-based roadmap for ${learning_goal}`);

      const template = await this.findBestMatchingTemplate(learning_goal);
      
      if (!template) {
        throw new Error(`No roadmap template found for: ${learning_goal}`);
      }

      logger.info(`Found template: ${template.title} (${template.template_id})`);

      const allSkills = this.extractSkillsFromTemplate(template.roadmap_data);
      
      if (allSkills.length === 0) {
        throw new Error('No skills found in template');
      }

      logger.info(`Extracted ${allSkills.length} skills from template`);

      const skillsToLearn = this.filterKnownSkills(allSkills, current_skills);
      
      logger.info(`Filtered to ${skillsToLearn.length} new skills (removed ${allSkills.length - skillsToLearn.length} known skills)`);

      const orderedSkills = this.orderSkillsByPrerequisites(skillsToLearn, experience_level);

      const phases = this.createLearningPhases(orderedSkills, experience_level);

      const roadmapWithEstimates = this.calculateTimeEstimates(phases, hours_per_week);

      const userRoadmap = await userRoadmapService.createUserRoadmap(
        user_id,
        template.template_id,
        template.version
      );

      const result = {
        user_roadmap_id: userRoadmap.user_roadmap_id,
        template_id: template.template_id,
        title: `Personalized ${template.title}`,
        description: template.description,
        total_skills: orderedSkills.length,
        skills_removed: allSkills.length - orderedSkills.length,
        total_phases: roadmapWithEstimates.phases.length,
        estimated_weeks: roadmapWithEstimates.estimated_weeks,
        estimated_completion_date: roadmapWithEstimates.estimated_completion_date,
        hours_per_week,
        phases: roadmapWithEstimates.phases,
        personalization: {
          experience_level,
          skills_already_known: current_skills.length,
          custom_filtering: true,
          ai_enhanced: false 
        }
      };

      logger.info(`Roadmap generated successfully`, {
        user_roadmap_id: userRoadmap.user_roadmap_id,
        total_skills: orderedSkills.length,
        estimated_weeks: roadmapWithEstimates.estimated_weeks
      });

      return result;

    } catch (error) {
      logger.error('Roadmap generation failed', { error: error.message });
      throw error;
    }
  }

  async findBestMatchingTemplate(learning_goal) {
    try {
      const { data: templates, error } = await db
        .from('roadmap_templates')
        .select('template_id, title, description, source_type, roadmap_data, version')
        .eq('is_active', true)
        .not('roadmap_data', 'is', null)  // Only get templates with actual data
        .order('version', { ascending: false });

      if (error) throw error;

      if (!templates || templates.length === 0) {
        throw new Error('No active roadmap templates with data found');
      }

      const searchTerm = learning_goal.toLowerCase().trim();
      
      // Exact match first
      let match = templates.find(t => 
        t.title.toLowerCase() === searchTerm
      );

      // Then partial match in title
      if (!match) {
        match = templates.find(t => 
          t.title.toLowerCase().includes(searchTerm)
        );
      }

      // Then check description
      if (!match) {
        match = templates.find(t => 
          t.description?.toLowerCase().includes(searchTerm)
        );
      }

      // Finally try word matching
      if (!match) {
        const words = searchTerm.split(' ');
        match = templates.find(t => 
          words.some(word => 
            word.length > 3 && t.title.toLowerCase().includes(word)
          )
        );
      }

      logger.info(`Template match: ${match?.title || 'Using first template'}`);
      return match || templates[0];

    } catch (error) {
      logger.error('Template search failed', { error: error.message });
      throw error;
    }
  }

  extractSkillsFromTemplate(templateData) {
    const skills = [];

    if (!templateData || !templateData.nodes) {
      logger.warn('Template data or nodes missing');
      return skills;
    }

    logger.info(`Processing ${templateData.nodes.length} nodes from template`);

    templateData.nodes.forEach(node => {
      // Only include topic and subtopic nodes with valid labels
      if ((node.type === 'topic' || node.type === 'subtopic') && node.data?.label && node.data.label.trim()) {
        const skillName = node.data.label.trim();
        
        // Skip generic/empty labels
        if (skillName.length < 2 || skillName === 'N/A') {
          return;
        }

        skills.push({
          id: node.id,
          name: skillName,
          type: node.type,
          description: node.data?.description || '',
          difficulty: this.inferDifficulty(node),
          estimated_hours: this.estimateSkillHours(node),
          prerequisites: this.findPrerequisites(node.id, templateData.edges),
          resources: node.data?.resources || []
        });
      }
    });

    logger.info(`Extracted ${skills.length} valid skills from template`);
    return skills;
  }

  filterKnownSkills(allSkills, knownSkills) {
    if (!knownSkills || knownSkills.length === 0) {
      return allSkills;
    }

    const knownSkillsLower = knownSkills.map(s => s.toLowerCase().trim());

    return allSkills.filter(skill => {
      const skillName = skill.name.toLowerCase().trim();
      
      if (knownSkillsLower.includes(skillName)) {
        return false;
      }

      return !knownSkillsLower.some(known => 
        skillName.includes(known) || known.includes(skillName)
      );
    });
  }

  orderSkillsByPrerequisites(skills, experience_level) {
    const skillMap = new Map(skills.map(s => [s.id, s]));
    const ordered = [];
    const visited = new Set();

    const visit = (skill) => {
      if (visited.has(skill.id)) return;
      
      visited.add(skill.id);

      if (skill.prerequisites && skill.prerequisites.length > 0) {
        skill.prerequisites.forEach(prereqId => {
          const prereq = skillMap.get(prereqId);
          if (prereq) {
            visit(prereq);
          }
        });
      }

      ordered.push(skill);
    };

    const prioritySkills = skills.filter(s => 
      this.matchesExperienceLevel(s, experience_level)
    );

    prioritySkills.forEach(visit);

    skills.forEach(visit);

    return ordered;
  }

  createLearningPhases(skills, experience_level) {
    const phases = [];
    const SKILLS_PER_PHASE = experience_level === 'beginner' ? 3 : 
                             experience_level === 'intermediate' ? 5 : 
                             experience_level === 'advanced' ? 7 : 5; 

    let currentPhase = [];
    let phaseNumber = 1;

    skills.forEach((skill, index) => {
      currentPhase.push(skill);

      if (currentPhase.length === SKILLS_PER_PHASE || index === skills.length - 1) {
        phases.push({
          phase: phaseNumber,
          title: this.generatePhaseTitle(phaseNumber, currentPhase),
          skills: currentPhase,
          skill_count: currentPhase.length,
          prerequisites: phaseNumber > 1 ? [`Phase ${phaseNumber - 1}`] : []
        });

        currentPhase = [];
        phaseNumber++;
      }
    });

    return phases;
  }

  calculateTimeEstimates(phases, hours_per_week) {
    let totalHours = 0;

    const phasesWithEstimates = phases.map(phase => {
      const phaseHours = phase.skills.reduce((sum, skill) => 
        sum + skill.estimated_hours, 0
      );

      const weeks = Math.ceil(phaseHours / hours_per_week);

      totalHours += phaseHours;

      return {
        ...phase,
        estimated_hours: phaseHours,
        estimated_weeks: weeks,
        hours_per_week
      };
    });

    const totalWeeks = Math.ceil(totalHours / hours_per_week);
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + (totalWeeks * 7));

    return {
      phases: phasesWithEstimates,
      total_hours: totalHours,
      estimated_weeks: totalWeeks,
      estimated_completion_date: estimatedCompletionDate.toISOString().split('T')[0]
    };
  }

  inferDifficulty(node) {
    if (node.data?.difficulty) {
      return node.data.difficulty;
    }

    // Infer from type
    if (node.type === 'topic') return 'intermediate';
    if (node.type === 'subtopic') return 'beginner';
    
    return 'intermediate';
  }

  estimateSkillHours(node) {
    if (node.data?.estimated_hours) {
      return node.data.estimated_hours;
    }

    const difficulty = this.inferDifficulty(node);
    
    const estimates = {
      beginner: 5,
      intermediate: 10,
      advanced: 20
    };

    return estimates[difficulty] || 10;
  }

  findPrerequisites(nodeId, edges) {
    if (!edges) return [];

    return edges
      .filter(edge => edge.target === nodeId)
      .map(edge => edge.source);
  }

  matchesExperienceLevel(skill, experience_level) {
    const levelOrder = ['beginner', 'intermediate', 'advanced'];
    const skillLevel = levelOrder.indexOf(skill.difficulty);
    const userLevel = levelOrder.indexOf(experience_level);

    return skillLevel >= userLevel && skillLevel <= userLevel + 1;
  }

  generatePhaseTitle(phaseNumber, skills) {
    if (phaseNumber === 1) {
      return 'Foundations';
    }
    
    const firstSkillName = skills[0]?.name || '';
    
    const phaseNames = [
      'Foundations',
      'Core Concepts',
      'Intermediate Skills',
      'Advanced Topics',
      'Specialization',
      'Mastery',
      'Expert Level'
    ];

    return phaseNames[phaseNumber - 1] || `Phase ${phaseNumber}`;
  }

  async getAvailableTemplates() {
    try {
      const { data: templates, error } = await db
        .from('roadmap_templates')
        .select('template_id, title, description, source_type, version, created_at')
        .eq('is_active', true)
        .order('title', { ascending: true });

      if (error) throw error;

      return templates || [];
    } catch (error) {
      logger.error('Failed to fetch templates', { error: error.message });
      throw error;
    }
  }

  async getMarketData(learning_goal) {
    try {
      const { supabaseAdmin } = require('../config/database');
      
      const { data, error } = await supabaseAdmin
        .from('skill_demand')
        .select(`
          skill_id,
          job_count,
          avg_salary,
          demand_score,
          trending_direction,
          Skills!inner(skill_name)
        `)
        .or(`Skills.skill_name.ilike.%${learning_goal}%`)
        .order('demand_score', { ascending: false })
        .limit(10);

      if (error) {
        logger.warn('Failed to fetch market data', { error: error.message });
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const high_demand_skills = data.map(d => d.Skills.skill_name);
      const salaries = data.map(d => d.avg_salary).filter(s => s > 0);
      const job_counts = data.reduce((sum, d) => sum + (d.job_count || 0), 0);
      
      return {
        high_demand_skills,
        avg_salary_min: Math.min(...salaries),
        avg_salary_max: Math.max(...salaries),
        job_count: job_counts,
        trending_skills: data.filter(d => d.trending_direction === 'up').map(d => d.Skills.skill_name)
      };

    } catch (error) {
      logger.warn('Market data fetch error', { error: error.message });
      return null;
    }
  }

  async getUserProfile(user_id) {
    try {
      const { data: skills, error } = await db
        .from('user_skills')
        .select('skill_name, proficiency_level')
        .eq('user_id', user_id);

      if (error) {
        logger.warn('Failed to fetch user profile', { error: error.message });
        return null;
      }

      return {
        assessed_skills: skills || [],
        skill_count: skills?.length || 0,
        proficiency_levels: skills?.map(s => s.proficiency_level) || []
      };

    } catch (error) {
      logger.warn('User profile fetch error', { error: error.message });
      return null;
    }
  }}

module.exports = new RoadmapGeneratorService();