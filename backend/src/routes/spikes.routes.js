// server/src/routes/spikes.routes.js
import express from 'express';
import { detectSpikes, getSpikeHistory } from '../services/spikeDetector.js';

const router = express.Router();

/**
 * GET /api/spikes
 * Get current spike status for a brand
 */
router.get('/', (req, res) => {
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
router.get('/history', (req, res) => {
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

export default router;