// server/src/models/MentionStore.js

class MentionStore {
  constructor() {
    this.mentions = [];
    this.maxSize = 15000;
  }

  add(mention) {
    // Prevent duplicates by URL (critical for news)
    if (mention.url) {
      const exists = this.mentions.some(m => m.url === mention.url);
      if (exists) {
        console.log(`Duplicate blocked by URL: ${mention.url}`);
        return null; // silently skip
      }
    }

    this.mentions.push(mention);

    // Keep size manageable
    if (this.mentions.length > this.maxSize) {
      this.mentions = this.mentions.slice(-this.maxSize);
    }

    return mention;
  }

  getAll(filters = {}) {
    let filtered = [...this.mentions];

    if (filters.brand) {
      const brandLower = filters.brand.toLowerCase().trim();
      filtered = filtered.filter(m =>
        m.brand && m.brand.toLowerCase() === brandLower
      );
    }

    if (filters.source) {
      filtered = filtered.filter(m => m.source === filters.source);
    }

    if (filters.sentiment) {
      filtered = filtered.filter(m => m.sentiment === filters.sentiment);
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(m => new Date(m.timestamp) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      filtered = filtered.filter(m => new Date(m.timestamp) <= end);
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return filtered;
  }

  getById(id) {
    return this.mentions.find(m => m.id === id);
  }

  getStats(brand, timeframe = '7d') {
    const timeframeMs = this.parseTimeframe(timeframe);
    const cutoff = Date.now() - timeframeMs;

    const brandLower = brand.toLowerCase();

    const relevantMentions = this.mentions.filter(m => {
      return m.brand && 
             m.brand.toLowerCase() === brandLower && 
             new Date(m.timestamp).getTime() >= cutoff;
    });

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    const sourceCounts = { reddit: 0, news: 0, twitter: 0 };
    let totalEngagement = 0;

    relevantMentions.forEach(m => {
      sentimentCounts[m.sentiment]++;
      sourceCounts[m.source] = (sourceCounts[m.source] || 0) + 1;
      totalEngagement += m.engagement.likes + m.engagement.comments + m.engagement.shares;
    });

    const total = relevantMentions.length;

    return {
      total,
      timeframe,
      sentiment: sentimentCounts,
      sources: sourceCounts,
      avgEngagement: total > 0 ? Math.round(totalEngagement / total) : 0,
      avgSentiment: total > 0 
        ? parseFloat((relevantMentions.reduce((sum, m) => sum + m.sentimentScore, 0) / total).toFixed(3))
        : 0
    };
  }

  parseTimeframe(timeframe) {
    const match = timeframe.match(/^(\d+)([hdw])$/);
    if (!match) return 24 * 60 * 60 * 1000; // 24h

    const value = parseInt(match[1]);
    const unit = match[2];

    return value * (
      unit === 'h' ? 3600000 :
      unit === 'd' ? 86400000 :
      604800000 // week
    );
  }

  clear() {
    this.mentions = [];
    console.log('Mention store cleared');
  }

  // Debug helper
  debugBrand(brand) {
    const lower = brand.toLowerCase();
    const matches = this.mentions.filter(m => m.brand?.toLowerCase() === lower);
    console.log(`Debug: Found ${matches.length} mentions for "${brand}" (stored as: ${[...new Set(matches.map(m => m.brand))].join(', ')})`);
    return matches;
  }
}

export const mentionStore = new MentionStore();