const express = require('express');
const router = express.Router();
const orchestratorController = require('../controllers/orchestrator.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/chat', authMiddleware, orchestratorController.routeMessage);

router.post('/suggestions', authMiddleware, orchestratorController.getSmartSuggestions);

router.post('/check-ins', authMiddleware, orchestratorController.getProactiveCheckIns);

router.post('/analyze-intent', authMiddleware, orchestratorController.analyzeIntent);

module.exports = router;
