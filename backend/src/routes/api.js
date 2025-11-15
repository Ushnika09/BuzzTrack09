// server/src/routes/api.js
import express from 'express';
import { mentionStore } from '../models/Mention.js';
import { detectSpikes, getSpikeHistory } from '../services/spikeDetector.js';
import { 
  addBrand, 
  removeBrand, 
  getTrackedBrands,
  triggerCollection 
} from '../services/dataCollector.js';
// Add these topic analysis imports
import { 
  extractTopics, 
  clusterByTopic, 
  getTrendingTopics,
  getTopicTimeline,
  compareTopicsAcrossBrands 
} from '../services/topicAnalyzer.js';


// Add this right after the imports, before the routes

/**
 * Parse timeframe string to milliseconds
 * Supports: 1h, 6h, 12h, 24h, 7d, 30d, 4w, etc.
 */
function parseTimeframe(timeframe) {
  const units = {
    'h': 3600000,    // hours to milliseconds
    'd': 86400000,   // days to milliseconds  
    'w': 604800000   // weeks to milliseconds
  };
  
  const match = timeframe.match(/^(\d+)([hdw])$/);
  if (!match) return 86400000; // default 24h
  
  const [, value, unit] = match;
  return parseInt(value) * units[unit];
}

/**
 * Get start date based on timeframe
 */
function getTimeframeDate(timeframe = '24h') {
  const ms = parseTimeframe(timeframe);
  return new Date(Date.now() - ms).toISOString();
}

// Helper function to get dominant sentiment
function getDominantSentiment(sentimentCounts) {
  if (!sentimentCounts) return 'neutral';
  
  const max = Math.max(sentimentCounts.positive, sentimentCounts.neutral, sentimentCounts.negative);
  if (max === sentimentCounts.positive) return 'positive';
  if (max === sentimentCounts.negative) return 'negative';
  return 'neutral';
}

const router = express.Router();

/**
 * GET /api/mentions
 * Get all mentions with optional filters
 */
router.get('/mentions', (req, res) => {
  try {
    const { 
      brand, 
      sentiment, 
      source, 
      startDate, 
      endDate, 
      limit = 100 
    } = req.query;

    const filters = {
      brand,
      sentiment,
      source,
      startDate,
      endDate
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    let mentions = mentionStore.getAll(filters);

    // Apply limit
    mentions = mentions.slice(0, parseInt(limit));

    res.json({
      success: true,
      count: mentions.length,
      mentions: mentions.map(m => m.toJSON())
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mentions/:id
 * Get specific mention by ID
 */
router.get('/mentions/:id', (req, res) => {
  try {
    const mention = mentionStore.getById(req.params.id);

    if (!mention) {
      return res.status(404).json({
        success: false,
        error: 'Mention not found'
      });
    }

    res.json({
      success: true,
      mention: mention.toJSON()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/stats
 * Get statistics for a brand - FIXED VERSION
 */
router.get('/stats', (req, res) => {
  try {
    const { brand, timeframe = '24h' } = req.query;

    if (!brand) {
      return res.status(400).json({
        success: false,
        error: 'Brand parameter is required'
      });
    }

    // Use the mentionStore's getStats method directly
    const stats = mentionStore.getStats(brand, timeframe);

    console.log(`📊 API /stats for ${brand}:`, {
      total: stats.total,
      sources: stats.sources,
      sentiment: stats.sentiment
    });

    // Ensure sources object has all expected properties
    const ensuredSources = {
      reddit: stats.sources?.reddit || 0,
      news: stats.sources?.news || 0,
      twitter: stats.sources?.twitter || 0
    };

    const response = {
      success: true,
      brand,
      timeframe,
      stats: {
        ...stats,
        sources: ensuredSources // Use the ensured sources
      }
    };

    console.log(`📤 Sending response for ${brand}:`, response.stats.sources);
    res.json(response);

  } catch (error) {
    console.error('❌ Error in /stats route:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/spikes
 * Get current spike status for a brand
 */
router.get('/spikes', (req, res) => {
  try {
    const { brand } = req.query;

    if (!brand) {
      return res.status(400).json({
        success: false,
        error: 'Brand parameter is required'
      });
    }

    const spike = detectSpikes(brand);

    res.json({
      success: true,
      spike
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/spikes/history
 * Get spike history for a brand
 */
router.get('/spikes/history', (req, res) => {
  try {
    const { brand, days = 7 } = req.query;

    if (!brand) {
      return res.status(400).json({
        success: false,
        error: 'Brand parameter is required'
      });
    }

    const history = getSpikeHistory(brand, parseInt(days));

    res.json({
      success: true,
      history
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/brands
 * Get list of tracked brands
 */
router.get('/brands', (req, res) => {
  try {
    const brands = getTrackedBrands();

    res.json({
      success: true,
      count: brands.length,
      brands
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/brands
 * Add a new brand to track
 */
router.post('/brands', (req, res) => {
  try {
    const { brand } = req.body;

    if (!brand) {
      return res.status(400).json({
        success: false,
        error: 'Brand name is required'
      });
    }

    const result = addBrand(brand);

    res.status(result.success ? 200 : 400).json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/brands/:brand
 * Remove a brand from tracking
 */
router.delete('/brands/:brand', (req, res) => {
  try {
    const result = removeBrand(req.params.brand);

    res.status(result.success ? 200 : 400).json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/collect/:brand
 * Manually trigger data collection for a brand
 */
router.post('/collect/:brand', async (req, res) => {
  try {
    const result = await triggerCollection(req.params.brand);

    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/overview
 * Get overview of all tracked brands
 */
router.get('/overview', (req, res) => {
  try {
    const brands = getTrackedBrands();
    const overview = brands.map(brand => {
      const stats = mentionStore.getStats(brand, '24h');
      const spike = detectSpikes(brand);

      return {
        brand,
        mentions24h: stats.total,
        sentiment: stats.sentiment,
        hasSpike: spike.detected,
        avgEngagement: stats.avgEngagement
      };
    });

    res.json({
      success: true,
      overview
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/**
 * GET /api/stats/overview
 * Get comprehensive platform-wide statistics
 */
router.get('/stats/overview', (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    const brands = getTrackedBrands();
    
    // Validate timeframe format
    if (!timeframe.match(/^\d+[hdw]$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timeframe format. Use like: 1h, 6h, 24h, 7d, 30d, 4w'
      });
    }

    // Collect stats from all brands using flexible timeframe
    const allStats = brands.map(brand => {
      const mentions = mentionStore.getAll({
        brand,
        startDate: getTimeframeDate(timeframe)
      });
      
      const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
      const sourceCounts = {};
      let totalEngagement = 0;

      mentions.forEach(m => {
        sentimentCounts[m.sentiment]++;
        sourceCounts[m.source] = (sourceCounts[m.source] || 0) + 1;
        totalEngagement += m.engagement.likes + m.engagement.comments + m.engagement.shares;
      });

      return {
        total: mentions.length,
        sentiment: sentimentCounts,
        sources: sourceCounts,
        avgEngagement: mentions.length > 0 ? Math.round(totalEngagement / mentions.length) : 0,
        mentions
      };
    });

    // Calculate platform breakdown
    const platformBreakdown = { reddit: 0, news: 0 };
    allStats.forEach(stat => {
      Object.entries(stat.sources || {}).forEach(([source, count]) => {
        platformBreakdown[source] = (platformBreakdown[source] || 0) + count;
      });
    });

    // Calculate overall sentiment
    const sentimentOverview = { positive: 0, neutral: 0, negative: 0 };
    allStats.forEach(stat => {
      Object.entries(stat.sentiment || {}).forEach(([type, count]) => {
        sentimentOverview[type] += count;
      });
    });

    // Convert to percentages
    const totalMentions = allStats.reduce((sum, stat) => sum + stat.total, 0);
    if (totalMentions > 0) {
      Object.keys(sentimentOverview).forEach(key => {
        sentimentOverview[key] = Math.round((sentimentOverview[key] / totalMentions) * 100);
      });
    }

    // Get top performing brands
    const topPerformingBrands = brands
      .map((brand, index) => ({
        brand,
        mentions: allStats[index]?.total || 0,
        sentiment: getDominantSentiment(allStats[index]?.sentiment),
        engagement: allStats[index]?.avgEngagement || 0
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5);

    const overview = {
      timeframe,
      totalMentions,
      totalBrands: brands.length,
      platformBreakdown,
      sentimentOverview,
      topPerformingBrands
    };

    res.json({
      success: true,
      overview
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/**
 * GET /api/stats/sources-comparison
 * Compare performance across different data sources
 */
router.get('/stats/sources-comparison', (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    const brands = getTrackedBrands();
    
    // Validate timeframe format
    if (!timeframe.match(/^\d+[hdw]$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timeframe format. Use like: 1h, 6h, 24h, 7d, 30d, 4w'
      });
    }

    const analyzeSource = (source) => {
      const sourceData = brands.map(brand => {
        const mentions = mentionStore.getAll({
          brand,
          source,
          startDate: getTimeframeDate(timeframe) // Use the global helper function
        });
        
        let totalSentiment = 0;
        let totalEngagement = 0;
        
        mentions.forEach(m => {
          totalSentiment += m.sentimentScore;
          totalEngagement += m.engagement.likes + m.engagement.comments + m.engagement.shares;
        });

        return {
          brand,
          mentions: mentions.length,
          avgSentiment: mentions.length > 0 ? totalSentiment / mentions.length : 0,
          avgEngagement: mentions.length > 0 ? totalEngagement / mentions.length : 0
        };
      });

      const totalMentions = sourceData.reduce((sum, item) => sum + item.mentions, 0);
      const avgSentiment = sourceData.reduce((sum, item) => sum + item.avgSentiment, 0) / Math.max(brands.length, 1);
      const avgEngagement = sourceData.reduce((sum, item) => sum + item.avgEngagement, 0) / Math.max(brands.length, 1);

      const topBrands = sourceData
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 3)
        .map(item => item.brand);

      return {
        totalMentions,
        avgSentiment: parseFloat(avgSentiment.toFixed(3)),
        avgEngagement: parseFloat(avgEngagement.toFixed(1)),
        topBrands
      };
    };

    const comparison = {
      reddit: analyzeSource('reddit'),
      news: analyzeSource('news')
    };

    res.json({
      success: true,
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
 * GET /api/topics/trending
 * Get trending topics across all brands
 */
router.get('/topics/trending', (req, res) => {
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
router.get('/topics/brand/:brand', (req, res) => {
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
      topics
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
router.get('/topics/clusters', (req, res) => {
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
router.get('/topics/timeline', (req, res) => {
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
router.get('/topics/comparison', (req, res) => {
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



export default router;