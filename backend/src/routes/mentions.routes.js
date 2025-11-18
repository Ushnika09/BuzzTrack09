// server/src/routes/mentions.routes.js
import express from 'express';
import { mentionStore } from '../models/MentionStore.js';

const router = express.Router();

/**
 * GET /api/mentions
 * Get all mentions with optional filters
 */
router.get('/', (req, res) => {
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
router.get('/:id', (req, res) => {
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

export default router;