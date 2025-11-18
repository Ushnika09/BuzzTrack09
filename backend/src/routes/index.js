// server/src/routes/index.js
import express from 'express';
import mentionsRoutes from './mentions.routes.js';
import statsRoutes from './stats.routes.js';
import brandsRoutes from './brands.routes.js';
import spikesRoutes from './spikes.routes.js';
import topicsRoutes from './topics.routes.js';
import debugRoutes from './debug.routes.js';

const router = express.Router();

// Mount route modules
router.use('/mentions', mentionsRoutes);
router.use('/stats', statsRoutes);
router.use('/brands', brandsRoutes);
router.use('/spikes', spikesRoutes);
router.use('/topics', topicsRoutes);

// Mount debug routes (remove in production)
if (process.env.NODE_ENV !== 'production') {
  router.use('/debug', debugRoutes);
}

// Legacy endpoint - kept for backward compatibility
router.get('/overview', (req, res) => {
  res.redirect(308, '/api/brands/overview');
});

export default router;