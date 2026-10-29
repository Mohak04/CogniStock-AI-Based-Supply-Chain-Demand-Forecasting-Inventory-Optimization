const ActivityLog = require('../models/ActivityLog');

const activityController = {
  getActivity: async (req, res, next) => {
    try {
      const logs = await ActivityLog.find({ companyId: req.companyId })
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({
        status: 'success',
        data: logs.map((log) => ({
          id: log._id,
          action: log.action,
          category: log.category,
          timestamp: log.createdAt.toISOString().slice(0, 16).replace('T', ' '),
          user: log.userEmail,
          details: log.details,
          status: log.status
        }))
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = activityController;
