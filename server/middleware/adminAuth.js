const { errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Middleware to check if user is authenticated and is an admin
 * TODO: Integrate with JWT authentication once auth system is built
 * For now, this is a placeholder that allows requests through
 */
const requireAdmin = (req, res, next) => {
  try {
    // TODO: Replace with actual JWT verification
    // const token = req.headers.authorization?.split(' ')[1];
    // const decoded = verifyToken(token);
    // req.user = decoded;

    // TEMPORARY: Allow all requests (for testing)
    // In production, uncomment the checks below
    // Using NULL for created_by since we don't have real user auth yet
    req.user = {
      user_id: null, // Will be NULL in database (allowed by schema)
      role: 'admin',
      username: 'admin'
    };

    // TODO: Uncomment when JWT auth is implemented
    // if (!req.user || req.user.role !== 'admin') {
    //   return errorResponse(res, 'Admin access required', 403);
    // }

    logger.info(`Admin access granted: ${req.user.username}`);
    next();

  } catch (error) {
    logger.error(`Admin auth error: ${error.message}`);
    return errorResponse(res, 'Authentication failed', 401);
  }
};

module.exports = {
  requireAdmin
};
