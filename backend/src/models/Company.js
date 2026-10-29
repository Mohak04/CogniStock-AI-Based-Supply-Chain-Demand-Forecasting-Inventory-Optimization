const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    default: 'Retail & FMCG'
  },
  tier: {
    type: String,
    enum: ['demo', 'standard', 'enterprise'],
    default: 'standard'
  },
  isDemo: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
