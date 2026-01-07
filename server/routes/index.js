const express = require('express');
const router = express.Router();
const contactRoutes = require('./contact.routes');
const importRoutes = require('./import.routes');
const syncRoutes = require('./sync.routes');
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
    },
    
  });
});

router.use('/contact', contactRoutes);
router.use('/import', importRoutes);
router.use('/sync', syncRoutes);

module.exports = router;