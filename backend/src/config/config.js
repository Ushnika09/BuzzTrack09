// server/src/config/config.js
export default {
  port: process.env.PORT || 5000,
  
  // API Keys
  newsApiKey: process.env.NEWS_API_KEY,
  
  // Data collection intervals (in milliseconds)
  intervals: {
    reddit: 60000,      // 1 minute
    news: 120000,       // 2 minutes
    twitter: 90000      // 1.5 minutes (if enabled)
  },
  
  // Spike detection thresholds
  spikeDetection: {
    timeWindow: 3600000,  // 1 hour in ms
    threshold: 2.5,        // 2.5x normal volume
    minMentions: 5         // Minimum mentions to consider
  },
  
  // Data sources configuration
  sources: {
    reddit: {
      enabled: true,
      baseUrl: 'https://www.reddit.com',
      subreddits: ['all', 'technology', 'business', 'news']
    },
    news: {
      enabled: true,
      baseUrl: 'https://newsapi.org/v2',
      pageSize: 20
    },
    twitter: {
      enabled: false, // Requires API keys
      baseUrl: 'https://api.twitter.com/2'
    }
  },
  
  // Sentiment analysis
  sentiment: {
    provider: 'local', // 'local' or 'openai'
    thresholds: {
      positive: 0.2,
      negative: -0.2
    }
  },
  
  // Rate limiting
  rateLimit: {
    maxRequestsPerMinute: 60,
    maxConcurrent: 5
  }
};