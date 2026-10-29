const mongoose = require('mongoose');

const forecastResultSchema = new mongoose.Schema({
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
  forecastRunId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForecastRun',
    required: true,
    index: true
  },
  sku: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  datasetVersion: {
    type: String,
    required: true
  },
  horizon: {
    type: Number,
    default: 30
  },
  frequency: {
    type: String,
    default: 'Daily'
  },
  selectedModel: {
    type: String,
    required: true
  },
  selectionRationale: {
    type: String,
    default: ''
  },
  metrics: {
    type: Object,
    default: {}
  },
  candidateModels: {
    type: Array,
    default: []
  },
  series: {
    type: Array,
    default: []
  },
  splitInfo: {
    type: Object,
    default: {}
  },
  warnings: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

forecastResultSchema.index({ companyId: 1, datasetId: 1, sku: 1, horizon: 1 });
forecastResultSchema.index({ companyId: 1, datasetId: 1, forecastRunId: 1 });

module.exports = mongoose.model('ForecastResult', forecastResultSchema);
