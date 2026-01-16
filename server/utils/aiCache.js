const logger = require('../utils/logger');

class AICache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      total_requests: 0,
      cache_size: 0
    };

    // Default TTL: 24 hours
    this.defaultTTL = 24 * 60 * 60 * 1000;

    // Max cache size (entries)
    this.maxSize = 1000;

    // Cleanup interval: every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);

    logger.info('AI Cache initialized', {
      defaultTTL: `${this.defaultTTL / 1000}s`,
      maxSize: this.maxSize
    });
  }

  generateKey(prompt, options = {}) {
    const normalized = {
      prompt: prompt.trim().toLowerCase().substring(0, 500),
      model: options.model || 'default',
      temperature: options.temperature || 0.7
    };

    return JSON.stringify(normalized);
  }

  get(prompt, options = {}) {
    this.stats.total_requests++;

    const key = this.generateKey(prompt, options);
    const cached = this.cache.get(key);

    if (!cached) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expires_at) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    cached.hit_count++;
    cached.last_accessed = Date.now();

    logger.debug('Cache HIT', { 
      prompt_preview: prompt.substring(0, 50),
      hit_count: cached.hit_count
    });

    return cached.response;
  }

  set(prompt, response, options = {}) {
    const key = this.generateKey(prompt, options);
    const ttl = options.ttl || this.defaultTTL;

    // Check max size
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      prompt: prompt.substring(0, 500),
      response,
      created_at: Date.now(),
      expires_at: Date.now() + ttl,
      last_accessed: Date.now(),
      hit_count: 0,
      options
    });

    this.stats.cache_size = this.cache.size;

    logger.debug('Cache SET', {
      prompt_preview: prompt.substring(0, 50),
      ttl: `${ttl / 1000}s`
    });
  }

  
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (value.last_accessed < oldestTime) {
        oldestTime = value.last_accessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('Cache eviction', { evicted_entries: 1 });
    }
  }

  cleanup() {
    const now = Date.now();
    let expired = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now > value.expires_at) {
        this.cache.delete(key);
        expired++;
      }
    }

    this.stats.cache_size = this.cache.size;

    if (expired > 0) {
      logger.info('Cache cleanup', { expired_entries: expired, remaining: this.cache.size });
    }
  }

  clear() {
    this.cache.clear();
    this.stats.cache_size = 0;
    logger.info('Cache cleared');
  }

  getStats() {
    const hit_rate = this.stats.total_requests > 0 
      ? (this.stats.hits / this.stats.total_requests * 100).toFixed(2) 
      : 0;

    return {
      ...this.stats,
      hit_rate: `${hit_rate}%`,
      cache_utilization: `${((this.cache.size / this.maxSize) * 100).toFixed(1)}%`
    };
  }

  getEntries() {
    const entries = [];
    
    for (const [key, value] of this.cache.entries()) {
      entries.push({
        prompt_preview: value.prompt,
        created_at: new Date(value.created_at).toISOString(),
        expires_at: new Date(value.expires_at).toISOString(),
        hit_count: value.hit_count,
        age_minutes: Math.floor((Date.now() - value.created_at) / 60000)
      });
    }

    return entries.sort((a, b) => b.hit_count - a.hit_count);
  }
}

const aiCache = new AICache();

module.exports = aiCache;