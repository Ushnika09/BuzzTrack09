// server/src/routes/debug.routes.js
// Debug endpoints - Remove in production
import express from 'express';
import { mentionStore } from '../models/MentionStore.js';

const router = express.Router();

/**
 * GET /api/debug/collection-status
 * Get raw data collection status
 */
router.get('/collection-status', (req, res) => {
  try {
    const { brand } = req.query;
    
    if (!brand) {
      return res.status(400).json({
        success: false,
        error: 'Brand parameter required'
      });
    }

    const allMentions = mentionStore.getAll({ brand });
    const sources = {
      reddit: allMentions.filter(m => m.source === 'reddit'),
      news: allMentions.filter(m => m.source === 'news'),
    };

    res.json({
      success: true,
      brand,
      totalMentions: allMentions.length,
      sources: {
        reddit: sources.reddit.length,
        news: sources.news.length,
      },
      recentMentions: allMentions.slice(0, 5).map(m => ({
        id: m.id,
        source: m.source,
        content: m.content.substring(0, 100),
        timestamp: m.timestamp,
        sentiment: m.sentiment
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/debug/news-test
 * Test News API directly
 */
router.get('/news-test', async (req, res) => {
  try {
    const { brand = 'Nike' } = req.query;
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
      return res.json({
        success: false,
        error: 'No NEWS_API_KEY in environment'
      });
    }

    const testUrl = `https://newsapi.org/v2/everything?q=${brand}&pageSize=5&sortBy=publishedAt&language=en`;
    
    const response = await fetch(testUrl, {
      headers: { 'X-Api-Key': apiKey }
    });

    const data = await response.json();

    res.json({
      success: true,
      apiStatus: response.status,
      totalResults: data.totalResults,
      articles: data.articles ? data.articles.map(a => ({
        title: a.title,
        source: a.source.name,
        publishedAt: a.publishedAt,
        url: a.url
      })) : [],
      rawResponse: data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;