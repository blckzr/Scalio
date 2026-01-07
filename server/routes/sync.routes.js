const express = require('express');
const router = express.Router();
const syncController = require('../controllers/sync.controller');
const { requireAdmin } = require('../middleware/adminAuth');

/**
 * POST /api/sync/trigger
 * Trigger manual sync from Level 1 sources
 * Query params: ?source=roadmap.sh (optional, defaults to 'all')
 * Admin only
 */
router.post('/trigger', requireAdmin, syncController.triggerSync);

/**
 * GET /api/sync/status
 * Get sync status and last run info
 * Admin only
 */
router.get('/status', requireAdmin, syncController.getSyncStatus);

module.exports = router;
