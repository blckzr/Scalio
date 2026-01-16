
const aiService = require('./ai.service');
const coachService = require('./coach.service');
const careerService = require('./career.service');
const assessmentService = require('./assessment.service');
const resourceService = require('./resource.service');
const notificationService = require('./notification.service');
const roadmapVersionService = require('./roadmapVersion.service');
const trendsService = require('./trends.service');
const logger = require('../utils/logger');
const RoadmapTemplate = require('../models/RoadmapTemplate.model');

class OrchestratorService {
  async routeIntent(userId, userMessage, context = {}) {
    try {
      logger.info('Orchestrator: Analyzing user intent', { userId, messageLength: userMessage.length });

      const intentAnalysis = await this.analyzeIntent(userMessage, context);

      logger.info('Intent classified', { 
        userId, 
        primaryIntent: intentAnalysis.primary,
        confidence: intentAnalysis.confidence 
      });

      const response = await this.executeIntent(userId, intentAnalysis, userMessage, context);

      return {
        success: true,
        intent: intentAnalysis.primary,
        confidence: intentAnalysis.confidence,
        response,
        agents_involved: intentAnalysis.agents,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Orchestrator routing error', { error: error.message, userId });
      throw error;
    }
  }

  async analyzeIntent(message, context) {
    const prompt = `You are an intelligent assistant coordinator. Analyze the user's message and determine their primary intent.

User Message: "${message}"

Context:
- Current roadmap progress: ${context.roadmapProgress || 'unknown'}
- Last activity: ${context.lastActivity || 'unknown'}
- Active goals: ${context.activeGoals ? JSON.stringify(context.activeGoals) : 'none'}

Available Agent Types:
1. STUDY_COACH - Daily check-ins, motivation, study planning, session tracking
2. CAREER_ADVISOR - Career paths, salary insights, skill gaps, market analysis
3. ROADMAP_GENERATOR - Create learning roadmaps, update paths, skill progression
4. CONTENT_CURATOR - Find resources, courses, tutorials, documentation
5. ASSESSMENT_TAKER - Skill assessments, proficiency testing, gap analysis
6. UPDATE_ASSISTANT - Roadmap version updates, change notifications
7. TREND_ANALYST - Industry trends, technology forecasts, market intelligence
8. GENERAL_CHAT - General conversation, questions not fitting other categories

Classify the intent and respond in JSON:
{
  "primary": "<PRIMARY_AGENT_TYPE>",
  "secondary": ["<OPTIONAL_SECONDARY_AGENTS>"],
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation",
  "agents": ["list", "of", "agents", "needed"],
  "parameters": {
    "key": "extracted parameters from message"
  }
}`;

    const response = await aiService.complete(prompt, {
      temperature: 0.3,
      parseJSON: true,
      cacheTTL: 600000 
    });

    return response;
  }

  async executeIntent(userId, intentAnalysis, userMessage, context) {
    const { primary, secondary = [], parameters = {} } = intentAnalysis;

    let primaryResponse;

    switch (primary) {
      case 'STUDY_COACH':
        primaryResponse = await this.handleStudyCoachIntent(userId, userMessage, parameters, context);
        break;

      case 'CAREER_ADVISOR':
        primaryResponse = await this.handleCareerAdvisorIntent(userId, userMessage, parameters, context);
        break;

      case 'ROADMAP_GENERATOR':
        primaryResponse = await this.handleRoadmapIntent(userId, userMessage, parameters, context);
        break;

      case 'CONTENT_CURATOR':
        primaryResponse = await this.handleContentIntent(userId, userMessage, parameters, context);
        break;

      case 'ASSESSMENT_TAKER':
        primaryResponse = await this.handleAssessmentIntent(userId, userMessage, parameters, context);
        break;

      case 'UPDATE_ASSISTANT':
        primaryResponse = await this.handleUpdateIntent(userId, userMessage, parameters, context);
        break;

      case 'TREND_ANALYST':
        primaryResponse = await this.handleTrendIntent(userId, userMessage, parameters, context);
        break;

      case 'GENERAL_CHAT':
        primaryResponse = await this.handleGeneralChat(userId, userMessage, parameters, context);
        break;

      default:
        primaryResponse = await this.handleGeneralChat(userId, userMessage, parameters, context);
    }

    let secondaryResponses = [];
    if (secondary.length > 0) {
      const secondaryPromises = secondary.map(agentType => {
        return this.executeSecondaryAgent(userId, agentType, userMessage, parameters, context)
          .catch(error => {
            logger.warn('Secondary agent execution failed', { agentType, error: error.message });
            return null;
          });
      });

      secondaryResponses = (await Promise.all(secondaryPromises)).filter(r => r !== null);
    }

    if (secondaryResponses.length > 0) {
      return this.combineResponses(primaryResponse, secondaryResponses);
    }

    return primaryResponse;
  }

  async handleStudyCoachIntent(userId, message, parameters, context) {
    if (message.toLowerCase().includes('motivat') || message.toLowerCase().includes('encourag')) {
      return await coachService.generateMotivation(userId);
    }

    if (message.toLowerCase().includes('plan') || message.toLowerCase().includes('schedule')) {
      return await coachService.generateStudyPlan(userId);
    }

    if (message.toLowerCase().includes('progress') || message.toLowerCase().includes('how am i doing')) {
      return await coachService.getDailyCheckin(userId);
    }

    return await coachService.getDailyCheckin(userId);
  }

  async handleCareerAdvisorIntent(userId, message, parameters, context) {
    const careerPath = parameters.career_path || context.careerGoal || 'Software Developer';

    if (message.toLowerCase().includes('salary') || message.toLowerCase().includes('earn')) {
      return await careerService.getCareerInsights(userId, careerPath);
    }

    if (message.toLowerCase().includes('skill gap') || message.toLowerCase().includes('what to learn')) {
      return await careerService.getSkillGapAnalysis(userId, careerPath);
    }

    // Default: comprehensive career insights
    return await careerService.getCareerInsights(userId, careerPath);
  }

  async handleRoadmapIntent(userId, message, parameters, context) {
    const userSkills = await assessmentService.getUserSkills(userId);
    const tags = userSkills.map(skill => skill.skill_name);
    const bestMatch = await RoadmapTemplate.findBestMatch(tags);
    return bestMatch;
  }

  
  async handleContentIntent(userId, message, parameters, context) {
    const skill = parameters.skill || parameters.topic || 'programming';

    if (message.toLowerCase().includes('recommend') || message.toLowerCase().includes('suggest')) {
      return await resourceService.getRecommendations(userId);
    }

    // Default: get curated resources
    return await resourceService.getCuratedContent(skill, parameters.difficulty_level);
  }

  async handleAssessmentIntent(userId, message, parameters, context) {
    const skill = parameters.skill || 'JavaScript';

    if (message.toLowerCase().includes('test') || message.toLowerCase().includes('assess')) {
      return await assessmentService.startAssessment(userId, skill);
    }

    // Default: suggest taking assessment
    return {
      message: 'Ready to assess your skills?',
      suggested_assessment: skill,
      action: 'START_ASSESSMENT'
    };
  }

  async handleUpdateIntent(userId, message, parameters, context) {
    const roadmapId = context.roadmapId;

    if (!roadmapId) {
      return { message: 'No active roadmap to check for updates.' };
    }

    const updates = await roadmapVersionService.checkForUpdates(userId, roadmapId);

    if (updates.has_updates) {
      const recommendation = await roadmapVersionService.getUpdateRecommendation(
        userId,
        roadmapId,
        updates.latest_version
      );
      return {
        updates_available: true,
        current_version: updates.current_version,
        latest_version: updates.latest_version,
        recommendation: recommendation.recommendation
      };
    }

    return {
      updates_available: false,
      message: 'Your roadmap is up to date!'
    };
  }

  async handleTrendIntent(userId, message, parameters, context) {
    const technology = parameters.technology || parameters.skill || 'JavaScript';

    if (message.toLowerCase().includes('trend') || message.toLowerCase().includes('popular')) {
      return await trendsService.getTrendingTechnologies(10);
    }

    if (message.toLowerCase().includes('salary') || message.toLowerCase().includes('pay')) {
      return await trendsService.getSalaryBenchmarks(technology);
    }

    if (message.toLowerCase().includes('forecast') || message.toLowerCase().includes('future')) {
      return await trendsService.getTechForecast(technology);
    }

    // Default: comprehensive market intelligence
    return await trendsService.getMarketIntelligence(technology);
  }

  async handleGeneralChat(userId, message, parameters, context) {
    const prompt = `You are Scalio, an AI learning assistant for Filipino tech professionals. 
    
User said: "${message}"

Provide a helpful, friendly response. Keep it conversational and encouraging.`;

    const response = await aiService.complete(prompt, {
      temperature: 0.7,
      cacheTTL: 3600000 
    });

    return {
      message: response,
      type: 'GENERAL_CHAT'
    };
  }

  async executeSecondaryAgent(userId, agentType, message, parameters, context) {
    try {
      switch (agentType) {
        case 'STUDY_COACH':
          return await this.handleStudyCoachIntent(userId, message, parameters, context);
        case 'CAREER_ADVISOR':
          return await this.handleCareerAdvisorIntent(userId, message, parameters, context);
        case 'TREND_ANALYST':
          return await this.handleTrendIntent(userId, message, parameters, context);
        default:
          return null;
      }
    } catch (error) {
      logger.error('Secondary agent error', { agentType, error: error.message });
      return null;
    }
  }

  combineResponses(primary, secondaryResponses) {
    return {
      primary_response: primary,
      additional_insights: secondaryResponses,
      combined: true
    };
  }


  async getSmartSuggestions(userId, userContext) {
    try {
      const suggestions = [];

      if (userContext.roadmapId) {
        const updates = await roadmapVersionService.checkForUpdates(userId, userContext.roadmapId);
        if (updates.has_updates) {
          suggestions.push({
            type: 'UPDATE_AVAILABLE',
            message: `Roadmap update available (v${updates.latest_version})`,
            action: 'CHECK_UPDATE'
          });
        }
      }

      // Check study streak
      if (userContext.daysSinceLastStudy > 1) {
        suggestions.push({
          type: 'MOTIVATION',
          message: 'Need motivation to get back on track?',
          action: 'GET_MOTIVATION'
        });
      }

      // Suggest assessment if none taken recently
      if (!userContext.recentAssessment) {
        suggestions.push({
          type: 'ASSESSMENT',
          message: 'Take a skill assessment to track progress',
          action: 'START_ASSESSMENT'
        });
      }

      // Trending technologies
      const trending = await trendsService.getTrendingTechnologies(3);
      if (trending.length > 0) {
        suggestions.push({
          type: 'TRENDING',
          message: `Trending: ${trending.map(t => t.technology_name).join(', ')}`,
          action: 'VIEW_TRENDS'
        });
      }

      return suggestions;

    } catch (error) {
      logger.error('Smart suggestions error', { error: error.message, userId });
      return [];
    }
  }

  async proactiveCheckIn(userId, userState) {
    try {
      const checkIns = [];

      // Daily study coach check-in
      if (this.shouldDoCoachCheckIn(userState)) {
        const coachMessage = await coachService.getDailyCheckin(userId);
        checkIns.push({
          agent: 'STUDY_COACH',
          type: 'DAILY_CHECKIN',
          content: coachMessage
        });
      }

      // Weekly career insights
      if (this.shouldDoCareerCheckIn(userState)) {
        const careerInsights = await careerService.getCareerInsights(userId, userState.careerGoal);
        checkIns.push({
          agent: 'CAREER_ADVISOR',
          type: 'WEEKLY_INSIGHTS',
          content: careerInsights
        });
      }

      // Roadmap update notifications
      if (userState.roadmapId && this.shouldCheckUpdates(userState)) {
        const updates = await roadmapVersionService.checkForUpdates(userId, userState.roadmapId);
        if (updates.has_updates) {
          checkIns.push({
            agent: 'UPDATE_ASSISTANT',
            type: 'UPDATE_NOTIFICATION',
            content: updates
          });
        }
      }

      return checkIns;

    } catch (error) {
      logger.error('Proactive check-in error', { error: error.message, userId });
      return [];
    }
  }

  shouldDoCoachCheckIn(userState) {
    if (!userState.lastCoachCheckIn) return true;
    
    const hoursSinceLastCheckIn = (Date.now() - new Date(userState.lastCoachCheckIn).getTime()) / (1000 * 60 * 60);
    return hoursSinceLastCheckIn >= 24; // Daily check-ins
  }

  shouldDoCareerCheckIn(userState) {
    if (!userState.lastCareerCheckIn) return true;
    
    const daysSinceLastCheckIn = (Date.now() - new Date(userState.lastCareerCheckIn).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastCheckIn >= 7; // Weekly check-ins
  }

  shouldCheckUpdates(userState) {
    if (!userState.lastUpdateCheck) return true;
    
    const daysSinceLastCheck = (Date.now() - new Date(userState.lastUpdateCheck).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastCheck >= 7; // Check weekly
  }
}

module.exports = new OrchestratorService();