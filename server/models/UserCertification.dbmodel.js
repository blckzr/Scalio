const db = require('../config/database');
const logger = require('../utils/logger');

class UserCertification {
  static async issueCertification({ user_id, certification_id, issued_by = null, roadmap_id = null, status = 'issued', certificate_path = null }) {
    try {
      const { data, error } = await db
        .from('user_certifications')
        .insert({
          user_id,
          certification_id,
          issued_by,
          roadmap_id,
          status,
          certificate_path
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error issuing certification:', error);
      throw error;
    }
  }

  static async getUserCertifications(user_id) {
    try {
      const { data, error } = await db
        .from('user_certifications')
        .select(`*, certifications(*), roadmap_id`)
        .eq('user_id', user_id);
      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user certifications:', error);
      throw error;
    }
  }
}

module.exports = UserCertification;
