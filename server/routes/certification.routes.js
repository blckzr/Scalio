const express = require('express');
const router = express.Router();
const CertificationController = require('../controllers/certification.controller');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/issue', authMiddleware, CertificationController.issueCertification);
router.get('/my', authMiddleware, CertificationController.getUserCertifications);

module.exports = router;
