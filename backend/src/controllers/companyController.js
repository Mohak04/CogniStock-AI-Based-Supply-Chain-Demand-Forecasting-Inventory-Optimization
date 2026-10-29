const Company = require('../models/Company');
const ActivityLog = require('../models/ActivityLog');

const companyController = {
  getCompany: async (req, res, next) => {
    try {
      const company = await Company.findById(req.companyId);
      if (!company) {
        return res.status(404).json({ status: 'error', message: 'Company not found' });
      }
      res.json({
        status: 'success',
        company: {
          id: company._id,
          name: company.name,
          industry: company.industry,
          tier: company.tier,
          isDemo: company.isDemo,
          createdAt: company.createdAt
        }
      });
    } catch (err) {
      next(err);
    }
  },

  updateCompany: async (req, res, next) => {
    try {
      const { name, industry } = req.body;
      const company = await Company.findById(req.companyId);
      if (!company) {
        return res.status(404).json({ status: 'error', message: 'Company not found' });
      }

      if (name) company.name = name.trim();
      if (industry) company.industry = industry.trim();
      await company.save();

      await ActivityLog.create({
        companyId: req.companyId,
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'Company Profile Updated',
        category: 'Settings',
        details: `Company profile updated: ${company.name} (${company.industry}).`,
        status: 'Success'
      });

      res.json({
        status: 'success',
        message: 'Company profile updated.',
        company
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = companyController;
