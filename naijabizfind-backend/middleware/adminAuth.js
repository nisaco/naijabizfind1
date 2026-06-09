import jwt from 'jsonwebtoken';

/**
 * JWT-based Admin Authentication Middleware
 * Replaces the weak header-based password check with secure JWT validation
 * Ensures only authorized admins can access sensitive endpoints
 */
const adminAuth = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Unauthorized: Missing or invalid authorization header' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token using admin-specific secret
    const adminSecret = process.env.ADMIN_JWT_SECRET;
    
    if (!adminSecret) {
      console.error('❌ ADMIN_JWT_SECRET is not configured. Admin routes will not work.');
      return res.status(500).json({ 
        message: 'Server configuration error' 
      });
    }

    const decoded = jwt.verify(token, adminSecret);

    // Verify admin role
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Forbidden: Admin role required' 
      });
    }

    // Attach decoded admin info to request
    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Unauthorized: Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Unauthorized: Token expired' 
      });
    }
    
    console.error('Admin auth error:', error);
    return res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

export default adminAuth;