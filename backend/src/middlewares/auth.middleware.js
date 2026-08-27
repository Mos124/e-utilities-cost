const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'e_utilities_cost_super_secret_jwt_key_2026';

const verifyToken = (req, res, next) => {
  let token = null;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน (Access token required)' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session หมดอายุหรือ Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง (เฉพาะผู้ดูแลระบบ Admin เท่านั้น)' });
  }
  next();
};

const requireStaffOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง (เฉพาะ Admin หรือ Staff เท่านั้น)' });
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireStaffOrAdmin
};
