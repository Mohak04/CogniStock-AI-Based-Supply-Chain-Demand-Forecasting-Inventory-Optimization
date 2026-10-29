const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true,
    index: true
  },
  defaultForecastHorizon: {
    type: Number,
    enum: [7, 14, 30],
    default: 30
  },
  serviceLevelZ: {
    type: Number,
    default: 1.65 // 95% service level
  },
  reviewPeriodDays: {
    type: Number,
    default: 7
  },
  leadTimeDaysDefault: {
    type: Number,
    default: 14
  },
  defaultModelFamily: {
    type: String,
    enum: ['XGBoost Regressor', 'ARIMA / SARIMA', 'Naive Baseline'],
    default: 'XGBoost Regressor'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CompanySettings', companySettingsSchema);
