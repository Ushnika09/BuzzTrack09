// server/src/models/Mention.js
import crypto from 'crypto';

export class Mention {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.brand = data.brand?.trim();
    this.source = data.source; // 'reddit', 'news', 'twitter'
    this.platform = data.platform || 'unknown';
    this.content = (data.content || '').trim();
    this.url = data.url || null;
    this.author = data.author || 'Unknown';
    this.sentiment = data.sentiment || 'neutral';
    this.sentimentScore = data.sentimentScore || 0;
    this.timestamp = data.timestamp || new Date().toISOString();
    this.engagement = {
      likes: Number(data.engagement?.likes || 0),
      comments: Number(data.engagement?.comments || 0),
      shares: Number(data.engagement?.shares || 0)
    };
    this.metadata = data.metadata || {};
  }

  generateId() {
    // Use URL if available (especially for news) → prevents duplicates
    if (this.url) {
      return `news_${crypto.createHash('md5').update(this.url).digest('hex').slice(0, 12)}`;
    }
    return crypto.randomBytes(12).toString('hex');
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