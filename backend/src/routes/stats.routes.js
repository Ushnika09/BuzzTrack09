// server/src/routes/stats.routes.js
import express from 'express';
import { mentionStore } from '../models/MentionStore.js';
import { getTrackedBrands } from '../services/dataCollector.js';
import { getTimeframeDate, getDominantSentiment } from '../utils/helpers.js';

const router = express.Router();

/**
 * GET /api/stats
 * Get statistics for a specific brand
 */
router.get('/', (req, res) => {
  try {
    const { brand, timeframe = '7d' } = req.query;

    if (!brand) {
      return res.status(400).json({
        success: false,
        error: 'Brand parameter is required'
      });
    }

    const stats = mentionStore.getStats(brand, timeframe);

    // Ensure sources object has all expected properties
    const ensuredSources = {
      reddit: stats.sources?.reddit || 0,
      news: stats.sources?.news || 0,
    };

    res.json({
      success: true,
      brand,
      timeframe,
      stats: {
        ...stats,
        sources: ensuredSources
      }
    });

  } catch (error) {
    console.error('Error in /stats route:', error);
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
router.get('/overview', (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    const brands = getTrackedBrands();
    
    // Validate timeframe format
    if (!timeframe.match(/^\d+[hdw]$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timeframe format. Use: 1h, 6h, 24h, 7d, 30d, 4w'
      });
    }

    // Collect stats from all brands
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
        avgEngagement: mentions.length > 0 ? Math.round(totalEngagement / mentions.length) : 0
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

    res.json({
      success: true,
      overview: {
        timeframe,
        totalMentions,
        totalBrands: brands.length,
        platformBreakdown,
        sentimentOverview,
        topPerformingBrands
      }
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
router.get('/sources-comparison', (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    const brands = getTrackedBrands();
    
    if (!timeframe.match(/^\d+[hdw]$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timeframe format'
      });
    }

    const analyzeSource = (source) => {
      const sourceData = brands.map(brand => {
        const mentions = mentionStore.getAll({
          brand,
          source,
          startDate: getTimeframeDate(timeframe)
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

    res.json({
      success: true,
      timeframe,
      comparison: {
        reddit: analyzeSource('reddit'),
        news: analyzeSource('news')
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;