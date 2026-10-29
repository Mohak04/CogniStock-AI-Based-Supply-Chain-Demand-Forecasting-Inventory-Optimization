const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. No valid session token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Session expired or invalid token. Please log in again.'
      });
    }

    const user = await User.findById(decoded.userId).populate('companyId');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User account not found or deactivated.'
      });
    }

    req.user = user;
    // Derive companyId strictly from the authenticated database user record
    req.companyId = user.companyId._id;
    req.company = user.companyId;

    next();
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Authentication processing error.'
    });
  }
}

module.exports = { authenticate };
