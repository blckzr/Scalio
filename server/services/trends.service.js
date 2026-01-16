const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');
const aiService = require('./ai.service');

class TrendsService {
  async getIndustryInsights({ year, source, category, limit = 10 }) {
    try {
      let query = supabaseAdmin
        .from('industry_insights')
        .select('*')
        .order('report_year', { ascending: false });

      if (year) query = query.eq('report_year', year);
      if (source) query = query.eq('source', source);
      if (category) query = query.eq('industry_category', category);
      
      query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error fetching industry insights:', error);
      throw error;
    }
  }

  async getGlobalTrends({ source, metric_type, technology, trend_direction, limit = 20 }) {
    try {
      let query = supabaseAdmin
        .from('global_trends')
        .select('*')
        .order('data_date', { ascending: false });

      if (source) query = query.eq('source', source);
      if (metric_type) query = query.eq('metric_type', metric_type);
      if (technology) query = query.ilike('technology_name', `%${technology}%`);
      if (trend_direction) query = query.eq('trend_direction', trend_direction);

      query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error fetching global trends:', error);
      throw error;
    }
  }

  async getTrendingTechnologies(limit = 10) {
    try {
      const { data, error } = await supabaseAdmin
        .from('global_trends')
        .select('technology_name, trend_score, year_over_year_growth, source')
        .eq('trend_direction', 'rising')
        .order('trend_score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error fetching trending technologies:', error);
      throw error;
    }
  }

  async getSalaryBenchmarks({ skill_name, experience_level }) {
    try {
      let query = supabaseAdmin
        .from('skill_salary_benchmarks')
        .select('*')
        .order('report_year', { ascending: false });

      if (skill_name) query = query.ilike('skill_name', `%${skill_name}%`);
      if (experience_level) query = query.eq('experience_level', experience_level);

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error fetching salary benchmarks:', error);
      throw error;
    }
  }

  async getTechForecast({ technology_name, forecast_horizon }) {
    try {
      let query = supabaseAdmin
        .from('tech_adoption_forecast')
        .select('*')
        .order('forecast_date', { ascending: false });

      if (technology_name) query = query.ilike('technology_name', `%${technology_name}%`);
      if (forecast_horizon) query = query.eq('forecast_horizon', forecast_horizon);

      const { data, error } = await query.limit(10);
      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error fetching tech forecast:', error);
      throw error;
    }
  }

  async addIndustryInsight(insightData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('industry_insights')
        .insert({
          source: insightData.source,
          report_year: insightData.report_year,
          report_title: insightData.report_title,
          report_url: insightData.report_url,
          key_findings: insightData.key_findings,
          skill_trends: insightData.skill_trends || {},
          salary_data: insightData.salary_data || {},
          industry_category: insightData.industry_category,
          confidence_score: insightData.confidence_score || 0.8,
          published_date: insightData.published_date || new Date()
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Industry insight added:', data.insight_id);
      return data;
    } catch (error) {
      logger.error('Error adding industry insight:', error);
      throw error;
    }
  }

  async addGlobalTrend(trendData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('global_trends')
        .insert({
          source: trendData.source,
          metric_type: trendData.metric_type,
          technology_name: trendData.technology_name,
          technology_category: trendData.technology_category,
          trend_score: trendData.trend_score,
          trend_direction: trendData.trend_direction,
          time_series_data: trendData.time_series_data || {},
          year_over_year_growth: trendData.year_over_year_growth,
          data_date: trendData.data_date,
          metadata: trendData.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Global trend added:', data.trend_id);
      return data;
    } catch (error) {
      logger.error('Error adding global trend:', error);
      throw error;
    }
  }

  async generateTechForecast(technology_name) {
    try {
      const trends = await this.getGlobalTrends({ technology: technology_name, limit: 5 });
      const industryData = await this.getIndustryInsights({ limit: 3 });

      const prompt = `You are a technology trend analyst. Generate a forecast for ${technology_name}.

EXISTING TRENDS DATA:
${JSON.stringify(trends, null, 2)}

INDUSTRY CONTEXT:
${JSON.stringify(industryData, null, 2)}

Analyze and predict:
1. Current adoption level (0-100 score)
2. Predicted adoption in 1 year and 2 years
3. Growth factors (what's driving adoption)
4. Risk factors (what could slow it down)
5. Confidence level in predictions

Return as JSON:
{
  "technology_name": "${technology_name}",
  "current_adoption_score": 65.5,
  "forecasts": [
    {
      "horizon": "1_year",
      "predicted_score": 75.0,
      "confidence_lower": 70.0,
      "confidence_upper": 80.0
    },
    {
      "horizon": "2_years",
      "predicted_score": 85.0,
      "confidence_lower": 78.0,
      "confidence_upper": 90.0
    }
  ],
  "growth_factors": ["factor1", "factor2"],
  "risk_factors": ["risk1", "risk2"],
  "overall_recommendation": "strong_growth|moderate_growth|stable|declining"
}`;

      const forecast = await aiService.complete(prompt, {
        model: 'gemini-2.0-flash-exp',
        temperature: 0.5,
        parseJSON: true
      });

      const { data, error } = await supabaseAdmin
        .from('tech_adoption_forecast')
        .insert({
          technology_name: technology_name,
          current_adoption_score: forecast.current_adoption_score,
          predicted_adoption_score: forecast.forecasts[0]?.predicted_score,
          forecast_horizon: '1_year',
          confidence_interval: {
            lower: forecast.forecasts[0]?.confidence_lower,
            upper: forecast.forecasts[0]?.confidence_upper
          },
          prediction_factors: {
            growth_factors: forecast.growth_factors,
            risk_factors: forecast.risk_factors
          },
          data_sources: ['ai_analysis', 'global_trends', 'industry_insights'],
          forecast_date: new Date()
        })
        .select()
        .single();

      if (error) logger.warn('Failed to save forecast:', error);

      return forecast;

    } catch (error) {
      logger.error('Error generating tech forecast:', error);
      throw error;
    }
  }

  async getMarketIntelligence(technology_name) {
    try {
      const [globalTrends, industryInsights, salaryBenchmarks, forecast] = await Promise.all([
        this.getGlobalTrends({ technology: technology_name, limit: 5 }),
        this.getIndustryInsights({ limit: 3 }),
        this.getSalaryBenchmarks({ skill_name: technology_name }),
        this.getTechForecast({ technology_name })
      ]);

      return {
        technology: technology_name,
        global_trends: globalTrends,
        industry_insights: industryInsights,
        salary_benchmarks: salaryBenchmarks,
        forecasts: forecast,
        summary: {
          total_data_points: globalTrends.length + industryInsights.length + salaryBenchmarks.length,
          has_salary_data: salaryBenchmarks.length > 0,
          has_forecast: forecast.length > 0,
          trend_direction: globalTrends[0]?.trend_direction || 'unknown'
        }
      };

    } catch (error) {
      logger.error('Error getting market intelligence:', error);
      throw error;
    }
  }
}

module.exports = new TrendsService();