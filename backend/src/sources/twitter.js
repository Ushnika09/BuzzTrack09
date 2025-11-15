import axios from 'axios';
import config from '../config/config.js';
import { Mention } from '../models/Mention.js';

// Rate limiting helper for free tier
let requestCount = 0;
let lastResetTime = Date.now();
const REQUESTS_PER_15_MIN = 100; // Free tier limit

function checkRateLimit() {
  const now = Date.now();
  // Reset counter every 15 minutes
  if (now - lastResetTime > 15 * 60 * 1000) {
    requestCount = 0;
    lastResetTime = now;
  }
  
  if (requestCount >= REQUESTS_PER_15_MIN) {
    throw new Error(`Twitter API rate limit exceeded. Used ${requestCount}/100 requests in 15 minutes`);
  }
  
  requestCount++;
  console.log(`🐦 Twitter API requests this period: ${requestCount}/100`);
}

export async function fetchTwitterMentions(brand, limit = 10) {
  if (!config.sources.twitter.enabled) {
    console.log('❌ Twitter source is disabled');
    return [];
  }

  const bearerToken = process.env.X_BEARER_TOKEN;
  
  if (!bearerToken) {
    console.log('❌ Twitter Bearer Token not configured');
    return [];
  }

  try {
    checkRateLimit();
    console.log(`🐦 Fetching Twitter mentions for: "${brand}"`);
    
    const mentions = await searchRecentTweets(brand, limit, bearerToken);
    
    console.log(`✅ Found ${mentions.length} Twitter mentions for "${brand}"`);
    return mentions;

  } catch (error) {
    console.error(`❌ Twitter API error for "${brand}":`, error.message);
    
    // Don't break other sources if Twitter fails
    return [];
  }
}

/**
 * Search for recent tweets using Twitter API v2
 */
async function searchRecentTweets(brand, limit, bearerToken) {
  try {
    const searchQuery = buildSearchQuery(brand);
    const url = 'https://api.twitter.com/2/tweets/search/recent';
    
    console.log(`🔍 Twitter search query: "${searchQuery}"`);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': 'BuzzTrack/1.0'
      },
      params: {
        query: searchQuery,
        'tweet.fields': 'created_at,public_metrics,author_id,context_annotations,entities,text',
        'user.fields': 'name,username,verified,public_metrics',
        'max_results': Math.min(limit, 100),
        'expansions': 'author_id',
        'sort_order': 'relevancy'
      },
      timeout: 30000 // 30 second timeout
    });

    return parseTweets(response.data, brand);

  } catch (error) {
    if (error.response) {
      // Twitter API returned an error
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error(`❌ Twitter API Error ${status}:`, errorData);
      
      if (status === 429) {
        console.log('⚠️ Twitter rate limit hit. Waiting for reset...');
      } else if (status === 401) {
        console.log('❌ Twitter authentication failed. Check your Bearer Token.');
      } else if (status === 403) {
        console.log('❌ Twitter access forbidden. Check your API permissions.');
      }
    } else if (error.request) {
      console.error('❌ No response from Twitter API:', error.message);
    } else {
      console.error('❌ Twitter request setup error:', error.message);
    }
    
    throw error;
  }
}

/**
 * Build search query for brand
 */
function buildSearchQuery(brand) {
  // Clean brand name for search
  const cleanBrand = brand.toLowerCase()
    .replace(/\b(inc|corp|corporation|llc|company|the|official)\b/gi, '')
    .trim()
    .replace(/\s+/g, '');
  
  // Multiple search strategies for better results
  const searchTerms = [
    `"${brand}"`, // Exact match
    `#${cleanBrand}`, // Hashtag
    `@${cleanBrand}` // Mentions
  ];
  
  // Combine search terms
  const query = searchTerms.join(' OR ');
  
  // Exclude retweets and non-English content for quality
  return `(${query}) -is:retweet lang:en -is:reply`;
}

/**
 * Parse Twitter API response into Mention objects
 */
function parseTweets(twitterData, brand) {
  if (!twitterData.data || !twitterData.data.length) {
    console.log('📭 No tweets found in Twitter API response');
    return [];
  }

  console.log(`📊 Twitter API returned ${twitterData.data.length} tweets`);
  
  // Build user map for author information
  const users = {};
  if (twitterData.includes && twitterData.includes.users) {
    twitterData.includes.users.forEach(user => {
      users[user.id] = user;
    });
  }

  return twitterData.data.map(tweet => {
    const author = users[tweet.author_id];
    const content = tweet.text;
    
    // Analyze sentiment
    const sentiment = analyzeTwitterSentiment(content, brand);
    
    // Calculate engagement score
    const engagement = tweet.public_metrics || {};
    const engagementScore = (engagement.like_count || 0) + 
                           (engagement.retweet_count || 0) * 2 + 
                           (engagement.reply_count || 0) * 1.5;
    
    return new Mention({
      brand,
      source: 'twitter',
      platform: 'twitter',
      content: content.length > 250 ? content.substring(0, 247) + '...' : content,
      url: author ? `https://twitter.com/${author.username}/status/${tweet.id}` : `https://twitter.com/i/web/status/${tweet.id}`,
      author: author ? `@${author.username}` : 'Unknown',
      sentiment: sentiment.sentiment,
      sentimentScore: sentiment.score,
      timestamp: tweet.created_at,
      engagement: {
        likes: engagement.like_count || 0,
        comments: engagement.reply_count || 0,
        shares: engagement.retweet_count || 0
      },
      metadata: {
        tweetId: tweet.id,
        authorId: tweet.author_id,
        verified: author?.verified || false,
        followersCount: author?.public_metrics?.followers_count || 0,
        followingCount: author?.public_metrics?.following_count || 0,
        tweetCount: author?.public_metrics?.tweet_count || 0,
        hashtags: tweet.entities?.hashtags?.map(h => h.tag) || [],
        mentions: tweet.entities?.mentions?.map(m => m.username) || [],
        engagementScore: engagementScore,
        authorName: author?.name || 'Unknown'
      }
    });
  });
}

/**
 * Enhanced sentiment analysis for Twitter content
 */
function analyzeTwitterSentiment(text, brand) {
  const lowerText = text.toLowerCase();
  const brandLower = brand.toLowerCase();
  
  // More comprehensive sentiment dictionaries
  const positiveWords = [
    'love', 'great', 'amazing', 'awesome', 'excellent', 'fantastic', 'perfect',
    'good', 'nice', 'cool', 'wow', 'best', 'brilliant', 'outstanding', 'superb',
    'impressive', 'incredible', 'wonderful', 'fabulous', 'marvelous', 'stellar',
    'phenomenal', 'exceptional', 'recommend', 'happy', 'pleased', 'satisfied',
    'thrilled', 'ecstatic', 'perfect', 'flawless', 'masterpiece', 'gamechanger'
  ];
  
  const negativeWords = [
    'hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'disappointing',
    'disappointed', 'sucks', 'trash', 'garbage', 'waste', 'useless', 'poor',
    'annoying', 'frustrating', 'ridiculous', 'stupid', 'dumb', 'broken',
    'failed', 'failure', 'awful', 'horrendous', 'atrocious', 'unacceptable',
    'scam', 'fraud', 'avoid', 'warning', 'complaint', 'issue', 'problem'
  ];

  // Brand-specific positive/negative context
  const brandPositive = [
    `${brandLower} is`, `${brandLower} has`, `${brandLower} delivers`,
    `${brandLower} creates`, `${brandLower} innovates`
  ];
  
  const brandNegative = [
    `${brandLower} failed`, `${brandLower} sucks`, `${brandLower} scam`,
    `${brandLower} broken`, `${brandLower} terrible`
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  // Check for positive words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) positiveCount += matches.length;
  });

  // Check for negative words
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeCount += matches.length;
  });

  // Check brand-specific context
  brandPositive.forEach(phrase => {
    if (lowerText.includes(phrase)) positiveCount += 2;
  });

  brandNegative.forEach(phrase => {
    if (lowerText.includes(phrase)) negativeCount += 2;
  });

  const total = positiveCount + negativeCount;
  
  if (total === 0) {
    return { sentiment: 'neutral', score: 0 };
  }

  const score = (positiveCount - negativeCount) / Math.max(1, total);
  
  if (score > 0.2) {
    return { sentiment: 'positive', score: Math.min(score, 1) };
  } else if (score < -0.2) {
    return { sentiment: 'negative', score: Math.max(score, -1) };
  } else {
    return { sentiment: 'neutral', score: 0 };
  }
}

