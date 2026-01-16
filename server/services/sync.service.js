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
      
      // Check if GitHub token is configured
      if (!process.env.GITHUB_TOKEN) {
        throw new Error('GITHUB_TOKEN is required for sync. Generate a token at https://github.com/settings/tokens');
      }
      
      const { owner, repo, path } = this.sources['roadmap.sh'];
      
      const { data: contents } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if (!Array.isArray(contents)) {
        throw new Error('Expected directory listing');
      }

      const roadmapDirs = contents.filter(item => item.type === 'dir');
      logger.info(`Found ${roadmapDirs.length} roadmaps in ${owner}/${repo}`);

      const results = {
        success: [],
        failed: [],
        skipped: [],
      };

      for (const dir of roadmapDirs) {
        const roadmapId = dir.name;
        logger.info(`Processing roadmap: ${roadmapId}`);

        try {
          const roadmapData = await this.fetchRoadmapData(owner, repo, `${path}/${roadmapId}`);
          
          if (!roadmapData) {
            results.skipped.push({ id: roadmapId, reason: 'No valid roadmap file found' });
            continue;
          }

          // Import using existing import service
          const importResult = await importRoadmap({
            title: roadmapData.title || this.formatRoadmapTitle(roadmapId),
            description: roadmapData.description || `Official ${roadmapId} roadmap from roadmap.sh`,
            category: this.mapToCategory(roadmapId),
            source_type: 'roadmap.sh',
            source_url: `https://github.com/${owner}/${repo}/tree/main/${path}/${roadmapId}`,
            roadmap_data: roadmapData.content,
            created_by: null, // System sync
          });

          results.success.push({
            id: roadmapId,
            version: importResult.version,
            roadmap_id: importResult.roadmap_id,
          });

          logger.info(` Synced ${roadmapId} - v${importResult.version}`);
        } catch (error) {
          logger.error(` Failed to sync ${roadmapId}:`, error.message);
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

  async fetchRoadmapData(owner, repo, path) {
    try {
      // First, check what files exist in the directory
      const { data: contents } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(contents)) {
        const fileNames = contents.map(f => f.name);
        logger.info(`Files in ${path}:`, fileNames);
      }

      // Try common filenames for roadmap data
      const possibleFiles = ['roadmap.json', 'content.json', 'data.json', 'index.json'];

      for (const filename of possibleFiles) {
        try {
          const { data } = await this.octokit.repos.getContent({
            owner,
            repo,
            path: `${path}/${filename}`,
          });

          if (data.type === 'file' && data.content) {
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            const parsed = JSON.parse(content);
            logger.info(`Found valid roadmap file: ${filename}`);
            return parsed;
          }
        } catch (error) {
          // File not found, try next
          continue;
        }
      }

      logger.warn(`No valid roadmap JSON found in ${path}`);
      return null;
    } catch (error) {
      logger.error(`Error fetching roadmap data from ${path}:`, error.message);
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
