const axios = require('axios');
const db = require('../config/database');
const logger = require('../utils/logger');

class MarketService {
  constructor() {
    this.joobleConfig = {
      apiKey: process.env.JOOBLE_API_KEY,
      baseUrl: 'https://jooble.org/api',
    };

    this.serpApiConfig = {
      apiKey: process.env.SERPAPI_API_KEY,
      baseUrl: 'https://serpapi.com/search',
    };
  }

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

  async fetchSerpApiJobs(skill, page = 1) {
    try {
      if (!this.serpApiConfig.apiKey || this.serpApiConfig.apiKey === 'your_serpapi_key_here') {
        logger.warn('SerpApi API credentials not configured');
        return { jobs: [], total: 0 };
      }

      const params = {
        api_key: this.serpApiConfig.apiKey,
        engine: 'google_jobs',
        q: skill,
        location: 'Philippines',
        hl: 'en',
        gl: 'ph',
      };

      if (page > 1) {
        params.start = (page - 1) * 10;
      }

      logger.info('SerpApi request:', { url: this.serpApiConfig.baseUrl, params: { ...params, api_key: params.api_key?.substring(0, 10) + '...' } });
      const response = await axios.get(this.serpApiConfig.baseUrl, { params });
      
      const jobs = response.data.jobs_results || [];
      const jobsWithSalary = jobs.map(job => {
        let salaryMin = null;
        let salaryMax = null;

        if (job.detected_extensions?.salary) {
          const salaryText = job.detected_extensions.salary;
          const numbers = salaryText.match(/[\d,]+/g);
          if (numbers && numbers.length >= 2) {
            salaryMin = parseFloat(numbers[0].replace(/,/g, ''));
            salaryMax = parseFloat(numbers[1].replace(/,/g, ''));
          } else if (numbers && numbers.length === 1) {
            const salary = parseFloat(numbers[0].replace(/,/g, ''));
            salaryMin = salary;
            salaryMax = salary;
          }
        }

        return {
          ...job,
          salary_min: salaryMin,
          salary_max: salaryMax,
        };
      });

      return {
        jobs: jobsWithSalary,
        total: response.data.search_information?.total_results || jobs.length,
        source: 'serpapi',
      };
    } catch (error) {
      logger.error(`SerpApi error for skill "${skill}":`, error.message);
      if (error.response) {
        logger.error('SerpApi error response:', { status: error.response.status, data: error.response.data });
      }
      return { jobs: [], total: 0, error: error.message };
    }
  }

  async aggregateSkillDemand(skill) {
    try {
      logger.info(`Aggregating demand for skill: ${skill}`);

      const [jooble, serpapi] = await Promise.all([
        this.fetchJoobleJobs(skill),
        this.fetchSerpApiJobs(skill),
      ]);

      const totalJobs = (jooble?.total || 0) + (serpapi?.total || 0);

      const serpapiSalaries = (serpapi?.jobs || [])
        .filter(job => job.salary_min && job.salary_max)
        .map(job => ({
          min: job.salary_min,
          max: job.salary_max,
          avg: (job.salary_min + job.salary_max) / 2,
        }));

      const allSalaries = serpapiSalaries;
      const avgSalary = allSalaries.length > 0
        ? allSalaries.reduce((sum, s) => sum + s.avg, 0) / allSalaries.length
        : null;

      // Calculate demand score (0-100)
      const demandScore = this.calculateDemandScore(totalJobs);

      return {
        skill,
        job_count: totalJobs,
        avg_salary: avgSalary ? Math.round(avgSalary) : null,
        demand_score: demandScore,
        sources: {
          jooble: jooble?.total || 0,
          serpapi: serpapi?.total || 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Error aggregating demand for ${skill}:`, error);
      throw error;
    }
  }

  calculateDemandScore(jobCount) {
    if (jobCount === 0) return 0;
    if (jobCount >= 1000) return 100;
    
    return Math.min(100, Math.round((Math.log10(jobCount + 1) / Math.log10(1000)) * 100));
  }

  async storeSkillDemand(skillName, demandData) {
    try {
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

      // Delete existing record for this skill (if any)
      await db
        .from('skill_demand')
        .delete()
        .eq('skill_id', skillId);
      
      // Insert new demand data with data_sources as JSONB
      const { data: result, error: insertError} = await db
        .from('skill_demand')
        .insert({
          skill_id: skillId,
          job_count: demandData.job_count,
          avg_salary: demandData.avg_salary,
          demand_score: demandData.demand_score,
          data_sources: demandData.sources, 
          last_updated: new Date().toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        logger.error(`Insert error for ${skillName}:`, {
          error: insertError,
          skillId,
          demandData
        });
        throw insertError;
      }
      
      logger.info(`Stored demand data for ${skillName} (${demandData.job_count} jobs, score: ${demandData.demand_score})`);
      return result;
    } catch (error) {
      logger.error(`Error storing skill demand for ${skillName}:`, error);
      throw error;
    }
  }

  async syncAllSkillsDemand() {
    try {
      logger.info('Starting full skill demand sync...');

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

  async getSkillDemand(skillName) {
    try {
      const { data: skill, error: skillError } = await db
        .from('Skills')
        .select('skill_id, skill_name')
        .ilike('skill_name', skillName)
        .single();

      if (skillError || !skill) {
        return null;
      }

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

  async getTopSkills(limit = 20) {
    try {
      const { data: demandRecords, error: demandError } = await db
        .from('skill_demand')
        .select('skill_id, job_count, avg_salary, demand_score, last_updated')
        .order('demand_score', { ascending: false })
        .order('job_count', { ascending: false })
        .limit(limit);

      if (demandError || !demandRecords || demandRecords.length === 0) {
        return [];
      }

      const skillIds = demandRecords.map(r => r.skill_id);
      const { data: skills, error: skillError } = await db
        .from('Skills')
        .select('skill_id, skill_name')
        .in('skill_id', skillIds);

      if (skillError) {
        logger.error('Error fetching skill names:', skillError);
        return [];
      }

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