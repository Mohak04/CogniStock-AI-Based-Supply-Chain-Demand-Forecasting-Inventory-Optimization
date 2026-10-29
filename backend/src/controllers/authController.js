const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const Company = require('../models/Company');
const User = require('../models/User');
const CompanySettings = require('../models/CompanySettings');
const ActivityLog = require('../models/ActivityLog');

const authController = {
  register: async (req, res, next) => {
    try {
      const { companyName, name, email, password, role = 'company_admin' } = req.body;

      if (!companyName || !name || !email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'All registration fields (companyName, name, email, password) are required.'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          status: 'error',
          message: 'A user with this work email already exists. Please sign in or use another email.'
        });
      }

      // Create new tenant Company
      const company = await Company.create({
        name: companyName.trim(),
        industry: 'Retail & FMCG',
        tier: 'standard',
        isDemo: false
      });

      // Hash password with bcryptjs
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        companyId: company._id,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: ['company_admin', 'inventory_manager'].includes(role) ? role : 'company_admin',
        lastLogin: new Date()
      });

      // Create default company settings
      await CompanySettings.create({
        companyId: company._id,
        defaultForecastHorizon: 30,
        serviceLevelZ: 1.65,
        reviewPeriodDays: 7,
        leadTimeDaysDefault: 14,
        defaultModelFamily: 'XGBoost Regressor'
      });

      // Audit Log
      await ActivityLog.create({
        companyId: company._id,
        userId: user._id,
        userEmail: user.email,
        action: 'Company Registration',
        category: 'Authentication',
        details: `Company '${company.name}' and initial administrator '${user.name}' registered.`,
        status: 'Success'
      });

      // Sign JWT
      const token = jwt.sign(
        { userId: user._id, companyId: company._id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        status: 'success',
        message: 'Registration successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: company._id,
          companyName: company.name,
          isDemo: false
        }
      });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required.'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail }).populate('companyId');

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        // Record failed attempt in audit if company exists
        await ActivityLog.create({
          companyId: user.companyId._id,
          userEmail: user.email,
          action: 'Failed Login Attempt',
          category: 'Security',
          details: `Failed password authentication for user '${user.email}'.`,
          status: 'Warning'
        });

        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password.'
        });
      }

      user.lastLogin = new Date();
      await user.save();

      // Audit Log
      await ActivityLog.create({
        companyId: user.companyId._id,
        userId: user._id,
        userEmail: user.email,
        action: 'User Login',
        category: 'Authentication',
        details: `User '${user.name}' (${user.role}) authenticated successfully.`,
        status: 'Success'
      });

      const token = jwt.sign(
        { userId: user._id, companyId: user.companyId._id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      res.json({
        status: 'success',
        message: 'Authentication successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId._id,
          companyName: user.companyId.name,
          isDemo: user.companyId.isDemo
        }
      });
    } catch (err) {
      next(err);
    }
  },

  getMe: async (req, res) => {
    res.json({
      status: 'success',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        lastLogin: req.user.lastLogin,
        companyId: req.company._id,
        companyName: req.company.name,
        industry: req.company.industry,
        isDemo: req.company.isDemo
      }
    });
  },

  logout: async (req, res) => {
    if (req.user && req.companyId) {
      await ActivityLog.create({
        companyId: req.companyId,
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'User Logout',
        category: 'Authentication',
        details: `User '${req.user.name}' signed out.`,
        status: 'Success'
      });
    }

    res.json({
      status: 'success',
      message: 'Logged out successfully.'
    });
  }
};

module.exports = authController;
