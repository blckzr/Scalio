const { errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');
const supabase = require('../config/database'); 

/**
 * Middleware to check if user is authenticated and is an admin
 * Integrates with Supabase Auth and UserProfiles table
 */

const requireAdmin = async (req, res, next) => {

  try {
    // 1. Check for the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authorization token required', 401);
    }
    const token = authHeader.split(' ')[1];


    // 2. Verify Token with Supabase Auth

    // This checks if the token is valid, not expired, and not revoked.

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      logger.warn(`Auth failed: ${authError?.message || 'Invalid token'}`);
      return errorResponse(res, 'Invalid or expired authentication token', 401);
    }

    // 3. Check User Role in Database
    // We query the "UserProfiles" table to see if this user has the 'admin' role.
    const { data: userProfile, error: dbError } = await supabase
      .from('UserProfiles') // Make sure this matches your exact table name (case-sensitive)
      .select('role, user_id, email, first_name') // Select only what we need
      .eq('user_id', user.id)
      .single();

    if (dbError || !userProfile) {
      logger.warn(`Profile lookup failed for user ${user.id}`);
      return errorResponse(res, 'User profile not found', 403);
    }

    // 4. Verify Admin Role
    if (userProfile.role !== 'admin') {
      logger.warn(`Access denied: User ${userProfile.email} (Role: ${userProfile.role}) tried to access admin route`);
      return errorResponse(res, 'Admin privileges required', 403);
    }


    // 5. Attach User to Request
    // This allows your controllers (like deleteUser) to access req.user.id
    req.user = {
      id: user.id,
      email: userProfile.email,
      role: userProfile.role,
      username: userProfile.first_name // Mapping first_name to username for consistency
    };
    logger.info(`Admin access granted: ${userProfile.email}`);
    next();


  } catch (error) {
    logger.error(`Admin auth error: ${error.message}`);
    return errorResponse(res, 'Internal authentication error', 500);
  }
};



module.exports = {requireAdmin};