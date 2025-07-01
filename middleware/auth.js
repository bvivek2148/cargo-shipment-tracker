const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }
    
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts.'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Middleware to check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    
    next();
  };
};

// Middleware to check if user has required permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }
    
    // Admin users have all permissions
    if (req.user.role === 'admin') {
      return next();
    }
    
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`
      });
    }
    
    next();
  };
};

// Middleware to check if user can access resource (owner or admin)
const requireOwnershipOrAdmin = (resourceUserField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }
    
    // Admin users can access any resource
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user owns the resource
    const resourceUserId = req.body[resourceUserField] || req.params[resourceUserField];
    
    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }
    
    next();
  };
};

// Middleware to rate limit login attempts
const rateLimitLogin = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next();
    }
    
    const user = await User.findByEmail(email);
    
    if (user && user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    next();
  }
};

// Middleware to log user activity
const logActivity = (action) => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        await req.user.logActivity(action, {
          method: req.method,
          url: req.originalUrl,
          body: req.method === 'GET' ? undefined : req.body
        }, req);
      }
    } catch (error) {
      console.error('Activity logging error:', error);
    }
    
    next();
  };
};

// Middleware to validate refresh token
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user and check if refresh token exists
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token. User not found.'
      });
    }
    
    const tokenExists = user.refreshTokens.some(rt => 
      rt.token === refreshToken && rt.expiresAt > new Date()
    );
    
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.'
      });
    }
    
    req.user = user;
    req.refreshToken = refreshToken;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }
    
    console.error('Refresh token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token validation.'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.isActive && !user.isLocked) {
      req.user = user;
    }
    
    next();
    
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  requirePermission,
  requireOwnershipOrAdmin,
  rateLimitLogin,
  logActivity,
  validateRefreshToken,
  optionalAuth
};
