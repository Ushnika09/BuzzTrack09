// server/src/routes/brands.routes.js
import express from 'express';
import { 
  addBrand, 
  removeBrand, 
  getTrackedBrands,
  triggerCollection 
} from '../services/dataCollector.js';
import { mentionStore } from '../models/MentionStore.js';
import { detectSpikes } from '../services/spikeDetector.js';

const router = express.Router();

/**
 * GET /api/brands
 * Get list of tracked brands
 */
router.get('/', (req, res) => {
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
router.post('/', (req, res) => {
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
router.delete('/:brand', (req, res) => {
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
 * GET /api/brands/overview
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

export default router;