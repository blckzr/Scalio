const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');
const { requireAdmin } = require('../middleware/adminAuth');

router.post('/sync', requireAdmin, marketController.syncSkillDemand);

router.post('/skills/:skill/aggregate', requireAdmin, marketController.aggregateSkillDemand);

router.get('/skills/:skill', marketController.getSkillDemand);

router.get('/top', marketController.getTopSkills);

module.exports = router;
