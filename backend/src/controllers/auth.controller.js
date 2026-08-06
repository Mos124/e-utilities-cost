const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'e_utilities_cost_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_SECRET = JWT_SECRET + '_refresh';

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'กรุณากรอก Username และ Password' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // set true in production with HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      accessToken,
      user: payload
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  return res.json({ message: 'ออกจากระบบสำเร็จ' });
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Refresh Token required' });
    }

    jwt.verify(token, REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid Refresh Token' });
      }

      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const payload = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      };

      const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return res.json({ accessToken: newAccessToken, user: payload });
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error during token refresh' });
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'full_name', 'role', 'created_at']
    });
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }
    return res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  getMe
};
