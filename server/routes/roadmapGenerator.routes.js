const express = require('express');
const router = express.Router();
const { controller, validation } = require('../controllers/roadmapGenerator.controller');
const authMiddleware = require('../middleware/auth');


router.post(
  '/',
  authMiddleware,
  validation.generateRoadmap,
  controller.generateRoadmap.bind(controller)
);

router.get(
  '/templates',
  authMiddleware,
  controller.getTemplates.bind(controller)
);

module.exports = router;