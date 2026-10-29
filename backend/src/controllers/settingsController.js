const CompanySettings = require('../models/CompanySettings');
const ActivityLog = require('../models/ActivityLog');

const settingsController = {
  getSettings: async (req, res, next) => {
    try {
      let settings = await CompanySettings.findOne({ companyId: req.companyId });
      if (!settings) {
        settings = await CompanySettings.create({
          companyId: req.companyId,
          defaultForecastHorizon: 30,
          serviceLevelZ: 1.65,
          reviewPeriodDays: 7,
          leadTimeDaysDefault: 14,
          defaultModelFamily: 'XGBoost Regressor'
        });
      }
      res.json({
        status: 'success',
        settings
      });
    } catch (err) {
      next(err);
    }
  },

  updateSettings: async (req, res, next) => {
    try {
      const {
        defaultForecastHorizon,
        serviceLevelZ,
        reviewPeriodDays,
        leadTimeDaysDefault,
        defaultModelFamily
      } = req.body;

      let settings = await CompanySettings.findOne({ companyId: req.companyId });
      if (!settings) {
        settings = new CompanySettings({ companyId: req.companyId });
      }

      if (defaultForecastHorizon) settings.defaultForecastHorizon = Number(defaultForecastHorizon);
      if (serviceLevelZ !== undefined) settings.serviceLevelZ = Number(serviceLevelZ);
      if (reviewPeriodDays !== undefined) settings.reviewPeriodDays = Number(reviewPeriodDays);
      if (leadTimeDaysDefault !== undefined) settings.leadTimeDaysDefault = Number(leadTimeDaysDefault);
      if (defaultModelFamily) settings.defaultModelFamily = defaultModelFamily;

      await settings.save();

      await ActivityLog.create({
        companyId: req.companyId,
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'System Settings Updated',
        category: 'Settings',
        details: `Updated parameters: Horizon=${settings.defaultForecastHorizon}d, Z=${settings.serviceLevelZ}, ReviewPeriod=${settings.reviewPeriodDays}d, Model=${settings.defaultModelFamily}.`,
        status: 'Success'
      });

      res.json({
        status: 'success',
        message: 'Settings updated successfully.',
        settings
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = settingsController;
