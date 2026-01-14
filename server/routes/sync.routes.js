const express = require('express');
const router = express.Router();
const syncController = require('../controllers/sync.controller');
const { requireAdmin } = require('../middleware/adminAuth');

router.post('/trigger', requireAdmin, syncController.triggerSync);

router.get('/status', requireAdmin, syncController.getSyncStatus);

module.exports = router;
