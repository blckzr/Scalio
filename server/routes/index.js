const express = require('express');
const router = express.Router();
const contactRoutes = require('./contact.routes');
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
module.exports = router;