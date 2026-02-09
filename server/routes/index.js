const express = require('express');
const router = express.Router();
const contactRoutes = require('./contact.routes');
const importRoutes = require('./import.routes');
const syncRoutes = require('./sync.routes');
const marketRoutes = require('./market.routes');
const assessmentRoutes = require('./assessment.routes');
const coachRoutes = require('./coach.routes');
const careerRoutes = require('./career.routes');
const resourceRoutes = require('./resource.routes');
const analyticsRoutes = require('./analytics.routes');
const notificationRoutes = require('./notification.routes');
const trendsRoutes = require('./trends.routes');
const orchestratorRoutes = require('./orchestrator.routes');
const adminAnalyticsRoutes = require('./adminAnalytics.routes');

const userRoutes = require("./user.routes")
const adminRoutes = require("./admin.routes")
const authRoutes = require("./auth.routes")

const certificationRoutes = require('./certification.routes');
const roadmapRoutes = require('./roadmap.routes');

router.use('/assessment', assessmentRoutes);
router.use('/coach', coachRoutes);
router.use('/career', careerRoutes);
router.use('/resources', resourceRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/trends', trendsRoutes);
router.use('/orchestrator', orchestratorRoutes);
router.use('/admin-analytics', adminAnalyticsRoutes);

router.use("/users", userRoutes)
router.use("/admin", adminRoutes)
router.use("/auth", authRoutes)

router.use('/certifications', certificationRoutes);
router.use('/roadmaps', roadmapRoutes);

module.exports = router;
