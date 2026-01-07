const axios = require('axios');
const db = require('../config/database');
const logger = require('../utils/logger');

class MarketService {
  constructor() {
    this.adzunaConfig = {
      appId: process.env.ADZUNA_APP_ID,
      apiKey: process.env.ADZUNA_API_KEY,
      baseUrl: 'https://api.adzuna.com/v1/api/jobs',
      country: 'ph',
    };

    this.careerjetConfig = {
      affid: process.env.CAREERJET_AFFID,
      baseUrl: 'https://public.api.careerjet.net/search',
      locale: 'en_PH',
    };

    this.joobleConfig = {
      apiKey: process.env.JOOBLE_API_KEY,
      baseUrl: 'https://jooble.org/api',
    };
  }

  /**
   * Fetch jobs from Adzuna API (Philippines)
   */
  async fetchAdzunaJobs(skill, page = 1) {
    try {
      if (!this.adzunaConfig.appId || !this.adzunaConfig.apiKey) {
        logger.warn('Adzuna API credentials not configured');
        return { jobs: [], total: 0 };
      }

      const url = `${this.adzunaConfig.baseUrl}/${this.adzunaConfig.country}/search/${page}`;
      const params = {
        app_id: this.adzunaConfig.appId,
        app_key: this.adzunaConfig.apiKey,
        what: skill,
        results_per_page: 50,
        'content-type': 'application/json',
      };

      const response = await axios.get(url, { params });
      
      return {
        jobs: response.data.results || [],
        total: response.data.count || 0,
        source: 'adzuna',
      };
    } catch (error) {
      logger.error(`Adzuna API error for skill "${skill}":`, error.message);
      return { jobs: [], total: 0, error: error.message };
    }
  }

  /**
   * Fetch jobs from Careerjet API (Philippines)
   */
  async fetchCareerjetJobs(skill, page = 1) {
    try {
      if (!this.careerjetConfig.affid) {
        logger.warn('Careerjet API credentials not configured');
        return { jobs: [], total: 0 };
      }

      const params = {
        affid: this.careerjetConfig.affid,
        locale_code: this.careerjetConfig.locale,
        keywords: skill,
        location: 'Philippines',
        page,
        pagesize: 50,
      };

      const response = await axios.get(this.careerjetConfig.baseUrl, { params });
      
      return {
        jobs: response.data.jobs || [],
        total: response.data.hits || 0,
        source: 'careerjet',
      };
    } catch (error) {
      logger.error(`Careerjet API error for skill "${skill}":`, error.message);
      return { jobs: [], total: 0, error: error.message };
    }
  }

  /**
   * Fetch jobs from Jooble API (Philippines)
   */
  async fetchJoobleJobs(skill, page = 1) {
    try {
      if (!this.joobleConfig.apiKey) {
        logger.warn('Jooble API credentials not configured');
        return { jobs: [], total: 0 };
      }

      const url = `${this.joobleConfig.baseUrl}/${this.joobleConfig.apiKey}`;
      const data = {
        keywords: skill,
        location: 'Philippines',
        page: page.toString(),
      };

      const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      return {
        jobs: response.data.jobs || [],
        total: response.data.totalCount || 0,
        source: 'jooble',
      };
    } catch (error) {
      logger.error(`Jooble API error for skill "${skill}":`, error.message);
      return { jobs: [], total: 0, error: error.message };
    }
  }

  /**
   * Aggregate job data from all sources for a skill
   */
  async aggregateSkillDemand(skill) {
    try {
      logger.info(`Aggregating demand for skill: ${skill}`);

      const [adzuna, careerjet, jooble] = await Promise.all([
        this.fetchAdzunaJobs(skill),
        this.fetchCareerjetJobs(skill),
        this.fetchJoobleJobs(skill),
      ]);

      // Calculate total job count
      const totalJobs = adzuna.total + careerjet.total + jooble.total;

      // Extract salary data from Adzuna (best source for PH salaries)
      const salaries = adzuna.jobs
        .filter(job => job.salary_min && job.salary_max)
        .map(job => ({
          min: job.salary_min,
          max: job.salary_max,
          avg: (job.salary_min + job.salary_max) / 2,
        }));

      const avgSalary = salaries.length > 0
        ? salaries.reduce((sum, s) => sum + s.avg, 0) / salaries.length
        : null;

      // Calculate demand score (0-100)
      const demandScore = this.calculateDemandScore(totalJobs);

      return {
        skill,
        job_count: totalJobs,
        avg_salary: avgSalary ? Math.round(avgSalary) : null,
        demand_score: demandScore,
        sources: {
          adzuna: adzuna.total,
          careerjet: careerjet.total,
          jooble: jooble.total,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Error aggregating demand for ${skill}:`, error);
      throw error;
    }
  }

  /**
   * Calculate demand score (0-100) based on job count
   */
  calculateDemandScore(jobCount) {
    if (jobCount === 0) return 0;
    if (jobCount >= 1000) return 100;
    
    // Logarithmic scale for better distribution
    return Math.min(100, Math.round((Math.log10(jobCount + 1) / Math.log10(1000)) * 100));
  }

  /**
   * Store skill demand data in database
   */
  async storeSkillDemand(skillName, demandData) {
    try {
      // Find or create skill
      const { data: existingSkill } = await db
        .from('Skills')
        .select('skill_id')
        .eq('skill_name', skillName)
        .single();

      let skillId;
      if (!existingSkill) {
        // Create new skill
        const { data: newSkill, error: insertError } = await db
          .from('Skills')
          .insert({ skill_name: skillName, skill_category: 'technical' })
          .select('skill_id')
          .single();

        if (insertError) {
          throw insertError;
        }

        skillId = newSkill.skill_id;
        logger.info(`Created new skill: ${skillName}`);
      } else {
        skillId = existingSkill.skill_id;
      }

      // Upsert skill_demand
      const { data: result, error: upsertError } = await db
        .from('skill_demand')
        .upsert({
          skill_id: skillId,
          job_count: demandData.job_count,
          avg_salary: demandData.avg_salary,
          demand_score: demandData.demand_score,
          data_sources: demandData.sources,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'skill_id'
        })
        .select()
        .single();

      if (upsertError) {
        throw upsertError;
      }

      logger.info(`Stored demand data for ${skillName} (${demandData.job_count} jobs)`);
      return result;
    } catch (error) {
      logger.error(`Error storing skill demand for ${skillName}:`, error);
      throw error;
    }
  }

  /**
   * Sync demand data for all skills in database
   */
  async syncAllSkillsDemand() {
    try {
      logger.info('Starting full skill demand sync...');

      // Get all skills from database
      const { data: skills, error: skillsError } = await db
        .from('Skills')
        .select('skill_id, skill_name')
        .order('skill_name');

      if (skillsError) {
        throw skillsError;
      }

      logger.info(`Found ${skills.length} skills to sync`);

      const results = {
        success: [],
        failed: [],
      };

      for (const skill of skills) {
        try {
          const demandData = await this.aggregateSkillDemand(skill.skill_name);
          await this.storeSkillDemand(skill.skill_name, demandData);
          
          results.success.push({
            skill: skill.skill_name,
            job_count: demandData.job_count,
            demand_score: demandData.demand_score,
          });

          // Rate limiting: wait 2 seconds between requests
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          logger.error(`Failed to sync ${skill.skill_name}:`, error.message);
          results.failed.push({
            skill: skill.skill_name,
            error: error.message,
          });
        }
      }

      logger.info('Skill demand sync completed', {
        success: results.success.length,
        failed: results.failed.length,
      });

      return results;
    } catch (error) {
      logger.error('Skill demand sync failed:', error);
      throw error;
    }
  }

  /**
   * Get skill demand data from database
   */
  async getSkillDemand(skillName) {
    try {
      // First, get the skill
      const { data: skill, error: skillError } = await db
        .from('Skills')
        .select('skill_id, skill_name')
        .ilike('skill_name', skillName)
        .single();

      if (skillError || !skill) {
        return null;
      }

      // Then get the demand data
      const { data: demandData, error: demandError } = await db
        .from('skill_demand')
        .select('job_count, avg_salary, demand_score, data_sources, last_updated')
        .eq('skill_id', skill.skill_id)
        .single();

      if (demandError || !demandData) {
        return null;
      }

      return {
        skill_name: skill.skill_name,
        ...demandData
      };
    } catch (error) {
      logger.error(`Error getting skill demand for ${skillName}:`, error);
      throw error;
    }
  }

  /**
   * Get top in-demand skills
   */
  async getTopSkills(limit = 20) {
    try {
      // Get top demand records
      const { data: demandRecords, error: demandError } = await db
        .from('skill_demand')
        .select('skill_id, job_count, avg_salary, demand_score, last_updated')
        .order('demand_score', { ascending: false })
        .order('job_count', { ascending: false })
        .limit(limit);

      if (demandError || !demandRecords || demandRecords.length === 0) {
        return [];
      }

      // Get skill names for each record
      const skillIds = demandRecords.map(r => r.skill_id);
      const { data: skills, error: skillError } = await db
        .from('Skills')
        .select('skill_id, skill_name')
        .in('skill_id', skillIds);

      if (skillError) {
        logger.error('Error fetching skill names:', skillError);
        return [];
      }

      // Combine the data
      const skillMap = {};
      skills.forEach(s => {
        skillMap[s.skill_id] = s.skill_name;
      });

      return demandRecords.map(d => ({
        skill_name: skillMap[d.skill_id],
        job_count: d.job_count,
        avg_salary: d.avg_salary,
        demand_score: d.demand_score,
        last_updated: d.last_updated
      }));
    } catch (error) {
      logger.error('Error getting top skills:', error);
      throw error;
    }
  }
}

module.exports = new MarketService();
