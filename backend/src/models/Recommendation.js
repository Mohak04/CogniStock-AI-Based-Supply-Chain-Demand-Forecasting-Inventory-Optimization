const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
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
  sku: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  productName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['High Priority', 'Medium Priority', 'Normal'],
    default: 'Normal'
  },
  status: {
    type: String,
    enum: ['Needs Review', 'Reviewed', 'Approved', 'Rejected'],
    default: 'Needs Review'
  },
  recommendedQty: {
    type: Number,
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  reorderPoint: {
    type: Number,
    required: true
  },
  safetyStock: {
    type: Number,
    default: 0
  },
  leadTimeDays: {
    type: Number,
    default: 14
  },
  inventoryPosition: {
    type: Number,
    default: 0
  },
  targetInventory: {
    type: Number,
    default: 0
  },
  unitCost: {
    type: Number,
    default: null
  },
  estimatedOrderCost: {
    type: Number,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  datasetVersion: {
    type: String,
    default: 'v1.0'
  }
}, {
  timestamps: true
});

recommendationSchema.index({ companyId: 1, datasetId: 1, sku: 1 }, { unique: true });
recommendationSchema.index({ companyId: 1, datasetId: 1, status: 1 });
recommendationSchema.index({ companyId: 1, datasetId: 1, priority: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
