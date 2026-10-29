const mongoose = require('mongoose');

const forecastRunSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
    index: true
  },
  datasetVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DatasetVersion',
    required: true
  },
  datasetVersion: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Failed'],
    default: 'Completed'
  },
  horizon: {
    type: Number,
    default: 30
  },
  frequency: {
    type: String,
    default: 'Daily'
  },
  totalSkusProcessed: {
    type: Number,
    default: 0
  },
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  warnings: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

forecastRunSchema.index({ companyId: 1, datasetId: 1, createdAt: -1 });
forecastRunSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('ForecastRun', forecastRunSchema);
