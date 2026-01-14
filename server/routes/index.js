const express = require('express');
const router = express.Router();
const contactRoutes = require('../routes/contact.routes');
const importRoutes = require('./import.routes');
const syncRoutes = require('./sync.routes');
const marketRoutes = require('./market.routes');
const userRoadmapRoutes = require('./userRoadmap.routes');
const roadmapGeneratorRoutes = require('./roadmapGenerator.routes');
const assessmentRoutes = require('./assessment.routes');
const coachRoutes = require('./coach.routes');
const careerRoutes = require('./career.routes');
const resourceRoutes = require('./resource.routes');
const analyticsRoutes = require('./analytics.routes');

const userRoutes = require("./user.routes")
const adminRoutes = require("./admin.routes")
const authRoutes = require("./auth.routes")



router.get('/', (req, res) => {
  res.json({
    message: 'Scalio Backend API',
    version: '1.0.0',
    status: 'operational',
    documentation: 'https://github.com/blckzr/Scalio/wiki',
    endpoints: {
      health: '/health',
      test: '/api/test',
      contact: '/api/contact',
      import: '/api/import',
      sync: '/api/sync',
      market: '/api/market',
      roadmaps: '/api/roadmaps',
      generateRoadmap: '/api/generate-roadmap',
      assessment: '/api/assessment',
      coach: '/api/coach',
      career: '/api/career',
      resources: '/api/resources',
      analytics: '/api/analytics',
    },
    
  });
});

router.use('/contact', contactRoutes);
router.use('/import', importRoutes);
router.use('/sync', syncRoutes);
router.use('/market', marketRoutes);
router.use('/roadmaps', userRoadmapRoutes);
router.use('/assessment', assessmentRoutes);
router.use('/generate-roadmap', roadmapGeneratorRoutes);
router.use('/coach', coachRoutes);
router.use('/career', careerRoutes);
router.use('/resources', resourceRoutes);
router.use('/analytics', analyticsRoutes);

router.use("/users", userRoutes)
router.use("/admin", adminRoutes)
router.use("/auth", authRoutes)
module.exports = router;