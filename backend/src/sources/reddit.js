// server/src/sources/reddit.js
import fetch from 'node-fetch';
import config from '../config/config.js';
import { Mention } from '../models/Mention.js';
import { analyzeSentimentWithContext } from '../services/sentimentAnalyzer.js';

/**
 * Fetch mentions from Reddit
 */
export async function fetchRedditMentions(brandName, limit = 25) {
  if (!config.sources.reddit.enabled) {
    return [];
  }

  const mentions = [];

  try {
    const subreddits = config.sources.reddit.subreddits;
    
    // Limit to 2 subreddits for speed
    for (const subreddit of subreddits.slice(0, 2)) {
      try {
        const results = await searchReddit(brandName, subreddit, limit);
        mentions.push(...results);
      } catch (error) {
        console.error(`❌ Reddit r/${subreddit} error:`, error.message);
      }
    }

    console.log(`✅ Fetched ${mentions.length} Reddit mentions for "${brandName}"`);
    return mentions;

  } catch (error) {
    console.error(`❌ Reddit fetch error for ${brandName}:`, error.message);
    return [];
  }
}

/**
 * Search Reddit for brand mentions
 */
async function searchReddit(brandName, subreddit, limit) {
  const searchUrl = `${config.sources.reddit.baseUrl}/r/${subreddit}/search.json?q=${encodeURIComponent(brandName)}&limit=${limit}&sort=new&restrict_sr=on`;

  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'BuzzTrack/1.0 (Brand Monitoring Tool)'
    }
  });

  if (!response.ok) {
    throw new Error(`Reddit API HTTP ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.data || !data.data.children) {
    return [];
  }

  const mentions = data.data.children
    .filter(child => child.data)
    .map(child => {
      const post = child.data;
      const content = post.selftext || post.title || '';
      const sentimentResult = analyzeSentimentWithContext(`${post.title} ${content}`, brandName);

      return new Mention({
        brand: brandName,
        source: 'reddit',
        platform: `r/${post.subreddit}`,
        content: post.title,
        url: `https://reddit.com${post.permalink}`,
        author: post.author,
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.score,
        timestamp: new Date(post.created_utc * 1000).toISOString(),
        engagement: {
          likes: post.ups || 0,
          comments: post.num_comments || 0,
          shares: 0
        },
        metadata: {
          subreddit: post.subreddit,
          postId: post.id,
          score: post.score,
          relevance: sentimentResult.relevance
        }
      });
    });

  return mentions;
}

/**
 * Get hot posts from specific subreddit
 */
export async function fetchRedditHotPosts(subreddit, brandName, limit = 10) {
  const url = `${config.sources.reddit.baseUrl}/r/${subreddit}/hot.json?limit=${limit}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BuzzTrack/1.0'
      }
    });

    if (!response.ok) return [];

    const data = await response.json();
    const mentions = [];

    data.data.children.forEach(child => {
      const post = child.data;
      const fullText = `${post.title} ${post.selftext || ''}`.toLowerCase();
      
      // Only include if brand is mentioned
      if (fullText.includes(brandName.toLowerCase())) {
        const sentimentResult = analyzeSentimentWithContext(fullText, brandName);
        
        mentions.push(new Mention({
          brand: brandName,
          source: 'reddit',
          platform: `r/${post.subreddit}`,
          content: post.title,
          url: `https://reddit.com${post.permalink}`,
          author: post.author,
          sentiment: sentimentResult.sentiment,
          sentimentScore: sentimentResult.score,
          timestamp: new Date(post.created_utc * 1000).toISOString(),
          engagement: {
            likes: post.ups || 0,
            comments: post.num_comments || 0,
            shares: 0
          },
          metadata: {
            subreddit: post.subreddit,
            postId: post.id
          }
        }));
      }
    });

    return mentions;

  } catch (error) {
    console.error(`❌ Reddit hot posts error:`, error.message);
    return [];
  }
}