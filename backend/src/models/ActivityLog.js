const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: {
    type: String,
    default: 'system@cognistock.demo'
  },
  action: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Authentication', 'Data Ingestion', 'Forecasting', 'Inventory', 'Reports', 'Settings', 'Security'],
    default: 'Inventory'
  },
  details: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Success', 'Failed', 'Warning', 'Info'],
    default: 'Success'
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  }
}, {
  timestamps: true
});

activityLogSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
