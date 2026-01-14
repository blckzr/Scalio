const db = require('../config/database');
const logger = require('../utils/logger');

const TESTING_MODE = process.env.AUTH_TESTING_MODE === 'true';

const authMiddleware = async (req, res, next) => {
  try {
    // TESTING MODE: Auto-authenticate
    if (TESTING_MODE) {
      req.user = {
        user_id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user'
      };
      logger.info('[AUTH TESTING MODE] Auto-authenticated as user_id: 1');
      return next();
    }

    // PRODUCTION MODE: Verify Supabase JWT token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required',
        error: 'No token provided. Authorization header must be in format: Bearer <token>',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    logger.info(`Attempting to verify token: ${token.substring(0, 20)}...`);

    // Verify Supabase token
    const { data: { user }, error } = await db.auth.getUser(token);
    
    logger.info(`Supabase auth response - User: ${user ? 'found' : 'null'}, Error: ${error ? error.message : 'none'}`);

    if (error || !user) {
      logger.error(`Token verification failed: ${error?.message || 'User not found'}`);
      return res.status(401).json({
        success: false,
        message: 'User authentication required',
        error: error?.message || 'Invalid or expired token',
        details: error || 'No user found',
        timestamp: new Date().toISOString()
      });
    }

    // Attach user info to request
    req.user = {
      user_id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user',
      first_name: user.user_metadata?.first_name,
      last_name: user.user_metadata?.last_name
    };

    logger.info(`User ${req.user.user_id} authenticated successfully`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error.message);

    return res.status(401).json({
      success: false,
      message: 'User authentication required',
      error: error.message || 'Authentication failed',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = { authMiddleware };
