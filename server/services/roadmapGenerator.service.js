const db = require('../config/database');
const logger = require('../utils/logger');
const userRoadmapService = require('./userRoadmap.service');

class RoadmapGeneratorService {
  async generateRoadmap({ user_id, learning_goal, current_skills = [], hours_per_week = 10, experience_level = 'beginner' }) {
    try {
      logger.info(`Generating roadmap for user ${user_id}`, {
        learning_goal,
        current_skills: current_skills.length,
        hours_per_week,
        experience_level
      });

      // Step 1: Find matching roadmap template
      const template = await this.findBestMatchingTemplate(learning_goal);
      
      if (!template) {
        throw new Error(`No roadmap template found for: ${learning_goal}`);
      }

      logger.info(`Found template: ${template.title} (${template.template_id})`);

      // Step 2: Extract skills from template
      const allSkills = this.extractSkillsFromTemplate(template.roadmap_data);
      
      if (allSkills.length === 0) {
        throw new Error('No skills found in template');
      }

      logger.info(`Extracted ${allSkills.length} skills from template`);

      // Step 3: Filter out skills user already knows
      const skillsToLearn = this.filterKnownSkills(allSkills, current_skills);
      
      logger.info(`Filtered to ${skillsToLearn.length} new skills (removed ${allSkills.length - skillsToLearn.length} known skills)`);

      // Step 4: Order skills by prerequisites and difficulty
      const orderedSkills = this.orderSkillsByPrerequisites(skillsToLearn, experience_level);

      // Step 5: Create learning phases
      const phases = this.createLearningPhases(orderedSkills, experience_level);

      // Step 6: Calculate time estimates
      const roadmapWithEstimates = this.calculateTimeEstimates(phases, hours_per_week);

      // Step 7: Create user roadmap in database
      const userRoadmap = await userRoadmapService.createUserRoadmap(
        user_id,
        template.template_id,
        template.version
      );

      // Step 8: Prepare response
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
          ai_enhanced: false // Phase 1: Rule-based only
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
        .order('version', { ascending: false });

      if (error) throw error;

      if (!templates || templates.length === 0) {
        throw new Error('No active roadmap templates found');
      }

      const searchTerm = learning_goal.toLowerCase().trim();
      
      // Try exact match first
      let match = templates.find(t => 
        t.title.toLowerCase().includes(searchTerm)
      );

      // Try fuzzy match on description
      if (!match) {
        match = templates.find(t => 
          t.description?.toLowerCase().includes(searchTerm)
        );
      }

      // Try partial word match
      if (!match) {
        const words = searchTerm.split(' ');
        match = templates.find(t => 
          words.some(word => 
            word.length > 3 && t.title.toLowerCase().includes(word)
          )
        );
      }

      // Default to first template if no match
      return match || templates[0];

    } catch (error) {
      logger.error('Template search failed', { error: error.message });
      throw error;
    }
  }

  extractSkillsFromTemplate(templateData) {
    const skills = [];

    if (!templateData || !templateData.nodes) {
      return skills;
    }

    // Extract from nodes (topics and subtopics)
    templateData.nodes.forEach(node => {
      if (node.type === 'topic' || node.type === 'subtopic') {
        skills.push({
          id: node.id,
          name: node.data?.label || node.id,
          type: node.type,
          description: node.data?.description || '',
          difficulty: this.inferDifficulty(node),
          estimated_hours: this.estimateSkillHours(node),
          prerequisites: this.findPrerequisites(node.id, templateData.edges),
          resources: node.data?.resources || []
        });
      }
    });

    return skills;
  }

  filterKnownSkills(allSkills, knownSkills) {
    if (!knownSkills || knownSkills.length === 0) {
      return allSkills;
    }

    const knownSkillsLower = knownSkills.map(s => s.toLowerCase().trim());

    return allSkills.filter(skill => {
      const skillName = skill.name.toLowerCase().trim();
      
      // Check exact match
      if (knownSkillsLower.includes(skillName)) {
        return false;
      }

      // Check partial match
      return !knownSkillsLower.some(known => 
        skillName.includes(known) || known.includes(skillName)
      );
    });
  }

  orderSkillsByPrerequisites(skills, experience_level) {
    // Create dependency graph
    const skillMap = new Map(skills.map(s => [s.id, s]));
    const ordered = [];
    const visited = new Set();

    // Topological sort (prerequisites first)
    const visit = (skill) => {
      if (visited.has(skill.id)) return;
      
      visited.add(skill.id);

      // Visit prerequisites first
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

    // Start with skills that match experience level
    const prioritySkills = skills.filter(s => 
      this.matchesExperienceLevel(s, experience_level)
    );

    prioritySkills.forEach(visit);

    // Add remaining skills
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

      // Create phase when we hit the limit or reach end
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
    // Check if node has explicit difficulty
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

    // Default estimates based on type
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
}

module.exports = new RoadmapGeneratorService();