import crypto from 'crypto';

export class Mention {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.brand = data.brand;
    this.source = data.source; // 'reddit', 'news', 'twitter'
    this.platform = data.platform; // Specific platform/subreddit
    this.content = data.content;
    this.url = data.url;
    this.author = data.author || 'Unknown';
    this.sentiment = data.sentiment || 'neutral';
    this.sentimentScore = data.sentimentScore || 0;
    // FIX: Always use current timestamp for new mentions
    this.timestamp = data.timestamp || new Date().toISOString();
    this.engagement = {
      likes: data.engagement?.likes || 0,
      comments: data.engagement?.comments || 0,
      shares: data.engagement?.shares || 0
    };
    this.metadata = data.metadata || {};
  }

  generateId() {
    return crypto.randomBytes(16).toString('hex');
  }

  toJSON() {
    return {
      id: this.id,
      brand: this.brand,
      source: this.source,
      platform: this.platform,
      content: this.content,
      url: this.url,
      author: this.author,
      sentiment: this.sentiment,
      sentimentScore: this.sentimentScore,
      timestamp: this.timestamp,
      engagement: this.engagement,
      metadata: this.metadata
    };
  }
}

// In-memory storage (replace with database later)
class MentionStore {
  constructor() {
    this.mentions = [];
    this.maxSize = 10000; // Keep last 10k mentions
  }

  add(mention) {
    this.mentions.push(mention);
    
    // Keep only recent mentions
    if (this.mentions.length > this.maxSize) {
      this.mentions = this.mentions.slice(-this.maxSize);
    }
    
    return mention;
  }

  getAll(filters = {}) {
    let filtered = [...this.mentions];

    if (filters.brand) {
      filtered = filtered.filter(m => 
        m.brand.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    if (filters.sentiment) {
      filtered = filtered.filter(m => m.sentiment === filters.sentiment);
    }

    if (filters.source) {
      filtered = filtered.filter(m => m.source === filters.source);
    }

    if (filters.startDate) {
      filtered = filtered.filter(m => 
        new Date(m.timestamp) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(m => 
        new Date(m.timestamp) <= new Date(filters.endDate)
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    return filtered;
  }

  getById(id) {
    return this.mentions.find(m => m.id === id);
  }

  getStats(brand, timeframe = '24h') {
    try {
      const now = Date.now();
      const timeframeMs = this.parseTimeframe(timeframe);
      const startTime = new Date(now - timeframeMs);

      console.log(`⏰ Timeframe debug for "${brand}":`, {
        timeframe,
        timeframeMs,
        now: new Date(now).toISOString(),
        startTime: startTime.toISOString(),
        totalMentionsInStore: this.mentions.length
      });

      // Case insensitive brand filter with proper date comparison
      const relevantMentions = this.mentions.filter(m => {
        const isBrandMatch = m.brand.toLowerCase() === brand.toLowerCase();
        const mentionDate = new Date(m.timestamp);
        const isInTimeframe = mentionDate >= startTime;
        
        return isBrandMatch && isInTimeframe;
      });

      console.log(`📊 getStats for "${brand}": ${relevantMentions.length} mentions out of ${this.mentions.filter(m => m.brand.toLowerCase() === brand.toLowerCase()).length} total`);

      // Initialize with ALL expected sources
      const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
      const sourceCounts = { reddit: 0, news: 0, twitter: 0 };
      let totalEngagement = 0;
      let totalSentimentScore = 0;

      relevantMentions.forEach(m => {
        // Count sentiment
        sentimentCounts[m.sentiment] = (sentimentCounts[m.sentiment] || 0) + 1;
        
        // Count sources
        if (m.source in sourceCounts) {
          sourceCounts[m.source]++;
        }
        
        totalEngagement += m.engagement.likes + m.engagement.comments + m.engagement.shares;
        totalSentimentScore += m.sentimentScore;
      });

      const result = {
        total: relevantMentions.length,
        timeframe,
        sentiment: sentimentCounts,
        sources: sourceCounts,
        avgEngagement: relevantMentions.length > 0 
          ? Math.round(totalEngagement / relevantMentions.length) 
          : 0,
        avgSentiment: relevantMentions.length > 0 
          ? parseFloat((totalSentimentScore / relevantMentions.length).toFixed(3)) 
          : 0
      };

      console.log(`📈 Final stats for "${brand}":`, {
        total: result.total,
        sources: result.sources,
        sentiment: result.sentiment
      });

      return result;

    } catch (error) {
      console.error('❌ Error in getStats:', error);
      return {
        total: 0,
        timeframe,
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        sources: { reddit: 0, news: 0, twitter: 0 },
        avgEngagement: 0,
        avgSentiment: 0
      };
    }
  }

  parseTimeframe(timeframe) {
    const units = {
      'h': 3600000,
      'd': 86400000,
      'w': 604800000
    };
    
    const match = timeframe.match(/^(\d+)([hdw])$/);
    if (!match) return 86400000; // default 24h
    
    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  clear() {
    this.mentions = [];
  }
}

export const mentionStore = new MentionStore();