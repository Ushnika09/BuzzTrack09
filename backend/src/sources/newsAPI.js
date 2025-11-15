import fetch from 'node-fetch';
import config from '../config/config.js';
import { Mention } from '../models/Mention.js';
import { analyzeSentimentWithContext } from '../services/sentimentAnalyzer.js';

/**
 * Fetch news mentions using News API
 */
export async function fetchNewsMentions(brandName, limit = 20) {
  // FIX: Use environment variable directly to bypass config caching issue
  const apiKey = process.env.NEWS_API_KEY || config.newsApiKey;
  
  if (!config.sources.news.enabled || !apiKey) {
    console.log('⚠️  News API disabled or no API key configured');
    return [];
  }

  try {
    const mentions = await searchNews(brandName, limit, apiKey);
    console.log(`✅ Fetched ${mentions.length} mentions from News API for "${brandName}"`);
    return mentions;
  } catch (error) {
    console.error('News API fetch error:', error.message);
    return [];
  }
}

/**
 * Search news articles
 */
async function searchNews(brandName, limit, apiKey) {
  const params = new URLSearchParams({
    q: brandName,
    pageSize: Math.min(limit, 100),
    sortBy: 'publishedAt',
    language: 'en'
  });

  const url = `${config.sources.news.baseUrl}/everything?${params}`;

  const response = await fetch(url, {
    headers: {
      'X-Api-Key': apiKey
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`News API error: ${error.message || response.status}`);
  }

  const data = await response.json();

  if (!data.articles || data.articles.length === 0) {
    return [];
  }

  const mentions = data.articles.map(article => {
    const content = article.description || article.title || '';
    const fullText = `${article.title} ${content}`;
    
    // Analyze sentiment
    const sentimentResult = analyzeSentimentWithContext(fullText, brandName);

    return new Mention({
      brand: brandName,
      source: 'news',
      platform: article.source.name,
      content: article.title,
      url: article.url,
      author: article.author || article.source.name,
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score,
      timestamp: article.publishedAt,
      engagement: {
        likes: 0, // News API doesn't provide engagement metrics
        comments: 0,
        shares: 0
      },
      metadata: {
        description: article.description,
        sourceName: article.source.name,
        sourceId: article.source.id,
        imageUrl: article.urlToImage,
        relevance: sentimentResult.relevance
      }
    });
  });

  return mentions;
}

/**
 * Fetch top headlines mentioning the brand
 */
export async function fetchTopHeadlines(brandName, category = 'business') {
  // FIX: Use environment variable directly
  const apiKey = process.env.NEWS_API_KEY || config.newsApiKey;
  
  if (!apiKey) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: brandName,
      category: category,
      pageSize: 10,
      language: 'en'
    });

    const url = `${config.sources.news.baseUrl}/top-headlines?${params}`;

    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    const mentions = (data.articles || []).map(article => {
      const fullText = `${article.title} ${article.description || ''}`;
      const sentimentResult = analyzeSentimentWithContext(fullText, brandName);

      return new Mention({
        brand: brandName,
        source: 'news',
        platform: article.source.name,
        content: article.title,
        url: article.url,
        author: article.author || article.source.name,
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.score,
        timestamp: article.publishedAt,
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0
        },
        metadata: {
          description: article.description,
          isTopHeadline: true,
          category: category
        }
      });
    });

    return mentions;

  } catch (error) {
    console.error('Error fetching top headlines:', error.message);
    return [];
  }
}