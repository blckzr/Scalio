const UserCertification = require('../models/UserCertification.dbmodel');

class CertificationService {
  static async issueCertification({ user_id, certification_id, issued_by = null, roadmap_id = null }) {
    // Optionally: check if already issued
    // 1. Fetch user info
    const User = require('../models/User.model');
    const { generateCertificate } = require('./certificateGenerator.service');
    const db = require('../config/database');

    // Fetch user
    const user = await User.findById(user_id);
    // Fetch certification
    const { data: cert, error: certError } = await db
      .from('certifications')
      .select('name, provider')
      .eq('certification_id', certification_id)
      .single();
    if (certError) throw certError;

    // Generate PDF certificate
    const userName = [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(' ');
    const certificateTitle = cert.name;
    const issuer = cert.provider || 'Scalio';
    const date = new Date().toISOString().split('T')[0];
    const outputDir = require('path').join(__dirname, '../certificates');
    const certificate_path = await generateCertificate({ userName, certificateTitle, issuer, date, outputDir });

    // Store relative path for portability
    const relPath = require('path').relative(require('path').join(__dirname, '..'), certificate_path);

    return await UserCertification.issueCertification({ user_id, certification_id, issued_by, roadmap_id, certificate_path: relPath });
  }

  static async getUserCertifications(user_id) {
    return await UserCertification.getUserCertifications(user_id);
  }
}

module.exports = CertificationService;
