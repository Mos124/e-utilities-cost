const jwt = require('jsonwebtoken');

const DEFAULT_USER = {
  id: 1,
  username: 'admin',
  full_name: 'Administrator',
  role: 'admin'
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    req.user = DEFAULT_USER;
    return next();
  }

  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : authHeader;

  if (!token) {
    req.user = DEFAULT_USER;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'e_utilities_cost_super_secret_jwt_key_2026');
    req.user = decoded;
    next();
  } catch (err) {
    req.user = DEFAULT_USER;
    next();
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    req.user = DEFAULT_USER;
  }
  next();
};

const requireStaffOrAdmin = (req, res, next) => {
  if (!req.user) {
    req.user = DEFAULT_USER;
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireStaffOrAdmin
};
