// server/src/routes/topics.routes.js
import express from 'express';
import { mentionStore } from '../models/MentionStore.js';
import { getTrackedBrands } from '../services/dataCollector.js';
import { 
  extractTopics, 
  clusterByTopic, 
  getTrendingTopics,
  getTopicTimeline,
  compareTopicsAcrossBrands,
  getTopicThemes,
  detectEmergingTopics 
} from '../services/topicAnalyzer.js';
import { getTimeframeDate } from '../utils/helpers.js';

const router = express.Router();

/**
 * GET /api/topics/trending
 * Get trending topics across all brands
 */
router.get('/trending', (req, res) => {
  try {
    const { timeframe = '24h', limit = 10 } = req.query;
    const brands = getTrackedBrands();
    
    const trendingTopics = getTrendingTopics(brands, timeframe, parseInt(limit));

    res.json({
      success: true,
      timeframe,
      trendingTopics
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/topics/brand/:brand
 * Get topics for a specific brand
 */
router.get('/brand/:brand', (req, res) => {
  try {
    const { brand } = req.params;
    const { timeframe = '24h', limit = 15 } = req.query;

    const mentions = mentionStore.getAll({
      brand,
      startDate: getTimeframeDate(timeframe)
    });

    const topics = extractTopics(mentions, parseInt(limit));

    res.json({
      success: true,
      brand,
      timeframe,
      topics,
      totalMentions: mentions.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/topics/clusters
 * Get clustered mentions by topic
 */
router.get('/clusters', (req, res) => {
  try {
    const { brand, timeframe = '24h' } = req.query;

    if (!brand) {
      return res.status(400).json({
        success: false,
        error: 'Brand parameter is required'
      });
    }

    const mentions = mentionStore.getAll({
      brand,
      startDate: getTimeframeDate(timeframe)
    });

    const clusters = clusterByTopic(mentions);

    res.json({
      success: true,
      brand,
      timeframe,
      clusters
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/topics/timeline
 * Get topic timeline for a brand
 */
router.get('/timeline', (req, res) => {
  try {
    const { brand, days = 7 } = req.query;

    if (!brand) {
      return res.status(400).json({
        success: false,
        error: 'Brand parameter is required'
      });
    }

    const timeline = getTopicTimeline(brand, parseInt(days));

    res.json({
      success: true,
      brand,
      timeline
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/topics/comparison
 * Compare topics across multiple brands
 */
router.get('/comparison', (req, res) => {
  try {
    const { brands, timeframe = '24h' } = req.query;
    
    let brandList;
    if (brands) {
      brandList = brands.split(',');
    } else {
      brandList = getTrackedBrands();
    }

    const comparison = compareTopicsAcrossBrands(brandList, timeframe);

    res.json({
      success: true,
      brands: brandList,
      timeframe,
      comparison
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/topics/themes
 * Get grouped topic themes (categories)
 */
router.get('/themes', (req, res) => {
  try {
    const { brand, timeframe = '24h' } = req.query;

    if (!brand) {
      return res.status(400).json({
        success: false,
        error: 'Brand parameter is required'
      });
    }

    const mentions = mentionStore.getAll({
      brand,
      startDate: getTimeframeDate(timeframe)
    });

    if (mentions.length === 0) {
      return res.json({
        success: true,
        brand,
        themes: [],
        message: 'No mentions available'
      });
    }

    const themes = getTopicThemes(mentions);

    res.json({
      success: true,
      brand,
      timeframe,
      themes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/topics/emerging
 * Detect emerging topics (new and rapidly growing)
 */
router.get('/emerging', (req, res) => {
  try {
    const { brand, limit = 5 } = req.query;

    if (!brand) {
      return res.status(400).json({
        success: false,
        error: 'Brand parameter is required'
      });
    }

    const mentions = mentionStore.getAll({ brand });

    if (mentions.length === 0) {
      return res.json({
        success: true,
        brand,
        emerging: [],
        message: 'No mentions available'
      });
    }

    const emerging = detectEmergingTopics(mentions, parseInt(limit));

    res.json({
      success: true,
      brand,
      emerging
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;