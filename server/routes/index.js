const express = require('express');
const router = express.Router();
const contactRoutes = require('../routes/contact.routes');
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
    },
    
  });
});

router.use('/contact', contactRoutes);
router.use("/users", userRoutes)
router.use("/admin", adminRoutes)
router.use("/auth", authRoutes)
module.exports = router;