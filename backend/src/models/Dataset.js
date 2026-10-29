const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: 'CSV / Excel Ingestion'
  },
  currentVersion: {
    type: String,
    default: 'v1.0'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

datasetSchema.index({ companyId: 1, isArchived: 1 });

module.exports = mongoose.model('Dataset', datasetSchema);
