const { Octokit } = require('@octokit/rest');
const logger = require('../utils/logger');
const { importRoadmap } = require('./import.service');

class SyncService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || undefined,
    });
    
    this.sources = {
      'roadmap.sh': {
        owner: 'kamranahmedse',
        repo: 'developer-roadmap',
        path: 'src/data/roadmaps',
        category: 'multiple',
      },
      'microsoft-learn': {
        owner: 'MicrosoftDocs',
        repo: 'learn',
        path: 'learn-pr',
        category: 'multiple',
      },
      // Add more sources as needed
    };
  }

 
  async syncRoadmapSh() {
    try {
      logger.info('Starting roadmap.sh sync...');

      const results = {
        success: [],
        failed: [],
        skipped: [],
      };

      // Fetch list of official roadmaps from roadmap.sh API
      const roadmapList = await this.fetchRoadmapList();
      
      if (!roadmapList || roadmapList.length === 0) {
        logger.warn('No roadmaps found from roadmap.sh API');
        return results;
      }

      logger.info(`Found ${roadmapList.length} roadmaps from roadmap.sh API`);

      for (const roadmap of roadmapList) {
        const roadmapId = roadmap.slug;
        logger.info(`Processing roadmap: ${roadmapId}`);

        try {
          // Fetch full roadmap data from API
          const roadmapData = await this.fetchRoadmapFromAPI(roadmapId);
          
          if (!roadmapData || !roadmapData.nodes) {
            results.skipped.push({ id: roadmapId, reason: 'No valid roadmap data returned' });
            continue;
          }

          // Import using existing import service
          const importResult = await importRoadmap({
            title: roadmap.title?.card || roadmap.title?.page || this.formatRoadmapTitle(roadmapId),
            description: roadmap.description || `Official ${roadmapId} roadmap from roadmap.sh`,
            category: this.mapToCategory(roadmapId),
            source_type: 'roadmap.sh',
            source_url: `https://roadmap.sh/${roadmapId}`,
            roadmap_data: roadmapData,
            created_by: null, // System sync
          });

          results.success.push({
            id: roadmapId,
            version: importResult.version,
            roadmap_id: importResult.roadmap_id,
          });

          logger.info(`✓ Synced ${roadmapId} - v${importResult.version}`);
        } catch (error) {
          logger.error(`✗ Failed to sync ${roadmapId}:`, error.message);
          results.failed.push({ id: roadmapId, error: error.message });
        }
      }

      logger.info('Roadmap.sh sync completed', {
        success: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
      });

      return results;
    } catch (error) {
      logger.error('Roadmap.sh sync failed:', error);
      throw error;
    }
  }

  async fetchRoadmapList() {
    try {
      // Fetch both main and beginner roadmaps
      const [mainRoadmaps, beginnerRoadmaps] = await Promise.all([
        fetch('https://roadmap.sh/api/v1-list-official-roadmaps').then(r => r.json()),
        fetch('https://roadmap.sh/api/v1-list-official-beginner-roadmaps').then(r => r.json()),
      ]);

      return [...mainRoadmaps, ...beginnerRoadmaps].filter(r => {
        // Only include roadmaps with 'editor' renderer (skip legacy formats)
        return r.renderer === 'editor' || !r.renderer;
      });
    } catch (error) {
      logger.error('Failed to fetch roadmap list:', error.message);
      return [];
    }
  }

  async fetchRoadmapFromAPI(roadmapId) {
    try {
      const response = await fetch(`https://roadmap.sh/api/v1-official-roadmap/${roadmapId}`);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      logger.error(`Failed to fetch roadmap ${roadmapId} from API:`, error.message);
      return null;
    }
  }


  async syncAllSources() {
    const results = {};

    try {
      // Sync roadmap.sh
      results['roadmap.sh'] = await this.syncRoadmapSh();

      // Add more sources here as implemented
      // results['microsoft-learn'] = await this.syncMicrosoftLearn();
      // results['google-developers'] = await this.syncGoogleDevelopers();

      return {
        timestamp: new Date().toISOString(),
        sources: results,
        summary: {
          total_success: Object.values(results).reduce((acc, r) => acc + r.success.length, 0),
          total_failed: Object.values(results).reduce((acc, r) => acc + r.failed.length, 0),
          total_skipped: Object.values(results).reduce((acc, r) => acc + r.skipped.length, 0),
        },
      };
    } catch (error) {
      logger.error('Multi-source sync failed:', error);
      throw error;
    }
  }

  async getSyncStatus() {
    // TODO: Store sync history in database
    // For now, return placeholder
    return {
      last_sync: null,
      next_scheduled: null,
      status: 'idle',
      sources: Object.keys(this.sources),
    };
  }

  /**
   * Map roadmap ID to category enum
   */
  mapToCategory(roadmapId) {
    const categoryMap = {
      'frontend': 'frontend',
      'backend': 'backend',
      'fullstack': 'fullstack',
      'full-stack': 'fullstack',
      'devops': 'devops',
      'data-science': 'data-science',
      'mobile': 'mobile',
      'android': 'mobile',
      'ios': 'mobile',
      'react-native': 'mobile',
      'flutter': 'mobile',
      'cybersecurity': 'cybersecurity',
      'cyber-security': 'cybersecurity',
      'ai-ml': 'ai-ml',
      'machine-learning': 'ai-ml',
      'ai': 'ai-ml',
    };

    const normalized = roadmapId.toLowerCase();
    
    for (const [key, value] of Object.entries(categoryMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }

    return 'fullstack';
  }

  formatRoadmapTitle(roadmapId) {
    return roadmapId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Roadmap';
  }
}

module.exports = new SyncService();
