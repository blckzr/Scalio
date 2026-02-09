const CertificationService = require('../services/certification.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

class CertificationController {
  static async issueCertification(req, res) {
    try {
      const { certification_id, roadmap_id } = req.body;
      const user_id = req.user?.user_id;
      // Optionally: check if user completed roadmap, etc.
      const issued = await CertificationService.issueCertification({ user_id, certification_id, roadmap_id });
      return successResponse(res, issued, 'Certification issued');
    } catch (error) {
      logger.error('Error issuing certification:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async getUserCertifications(req, res) {
    try {
      const user_id = req.user?.user_id;
      const certs = await CertificationService.getUserCertifications(user_id);
      return successResponse(res, certs, 'User certifications retrieved');
    } catch (error) {
      logger.error('Error fetching user certifications:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = CertificationController;
