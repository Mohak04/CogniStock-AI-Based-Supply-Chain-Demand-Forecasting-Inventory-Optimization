const mongoose = require('mongoose');

const modelEvaluationSchema = new mongoose.Schema({
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
    default: null
  },
  forecastRunId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForecastRun'
  },
  datasetVersion: {
    type: String,
    required: true
  },
  models: {
    type: Array,
    required: true
  },
  chartData: {
    type: Array,
    required: true
  }
}, {
  timestamps: true
});

modelEvaluationSchema.index({ companyId: 1, datasetId: 1, createdAt: -1 });
modelEvaluationSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('ModelEvaluation', modelEvaluationSchema);
