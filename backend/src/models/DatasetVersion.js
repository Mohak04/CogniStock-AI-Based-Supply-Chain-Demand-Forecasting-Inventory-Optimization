const mongoose = require('mongoose');

const datasetVersionSchema = new mongoose.Schema({
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
  version: {
    type: String,
    required: true,
    default: 'v1.0'
  },
  originalFileName: {
    type: String,
    required: true
  },
  storedFilePath: {
    type: String,
    required: true
  },
  fileChecksum: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  fileType: {
    type: String,
    enum: ['CSV', 'XLSX'],
    default: 'CSV'
  },
  rowCount: {
    type: Number,
    default: 0
  },
  skuCount: {
    type: Number,
    default: 0
  },
  dateRange: {
    type: String,
    default: 'Unavailable'
  },
  detectedFrequency: {
    type: String,
    default: 'Daily'
  },
  mappings: {
    type: Map,
    of: String,
    default: {}
  },
  qualityScore: {
    type: Number,
    default: 0.0
  },
  qualityStatus: {
    type: String,
    default: 'Passed Validation'
  },
  qualityReport: {
    type: Object,
    default: {}
  },
  samplePreview: {
    type: Array,
    default: []
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

datasetVersionSchema.index({ companyId: 1, datasetId: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('DatasetVersion', datasetVersionSchema);
