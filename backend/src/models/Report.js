const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
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
    ref: 'ForecastRun',
    default: null
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'Product Analysis Report',
      'Company Inventory Report',
      'Forecast Evaluation Report',
      'Data Quality Report'
    ],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  datasetVersion: {
    type: String,
    default: 'v1.0'
  },
  skuScope: {
    type: String,
    default: 'Catalog Overview'
  },
  status: {
    type: String,
    enum: ['Ready', 'Processing', 'Failed'],
    default: 'Ready'
  },
  pdfPath: {
    type: String,
    default: null
  },
  fileFormat: {
    type: String,
    default: 'PDF'
  },
  executiveSummary: {
    type: String,
    default: ''
  },
  reportData: {
    type: Object,
    default: {}
  },
  generatedBy: {
    type: String,
    default: 'System Officer'
  }
}, {
  timestamps: true
});

reportSchema.index({ companyId: 1, datasetId: 1, createdAt: -1 });
reportSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
