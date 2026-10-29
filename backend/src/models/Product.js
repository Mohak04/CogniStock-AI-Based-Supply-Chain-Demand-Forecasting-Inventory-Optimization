const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  sku: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'General'
  },
  unitPrice: {
    type: Number,
    default: null
  },
  unitCost: {
    type: Number,
    default: null
  },
  leadTimeDays: {
    type: Number,
    default: null
  },
  currentStock: {
    type: Number,
    default: null
  },
  onOrder: {
    type: Number,
    default: 0
  },
  backorders: {
    type: Number,
    default: 0
  },
  safetyStock: {
    type: Number,
    default: null
  },
  reorderPoint: {
    type: Number,
    default: null
  },
  targetInventory: {
    type: Number,
    default: null
  },
  recommendedQty: {
    type: Number,
    default: 0
  },
  riskLevel: {
    type: String,
    enum: ['High Risk', 'Medium Risk', 'Low Risk', 'Overstock', 'Unavailable'],
    default: 'Unavailable'
  },
  riskReason: {
    type: String,
    default: 'No calculations performed yet'
  },
  demandTrend: {
    type: String,
    default: 'Neutral Trend'
  },
  variability: {
    type: String,
    default: 'Moderate'
  },
  seasonality: {
    type: String,
    default: 'Standard Weekly'
  },
  averageDailyDemand: {
    type: Number,
    default: 0
  },
  forecastDemand30d: {
    type: Number,
    default: 0
  },
  modelUsed: {
    type: String,
    default: 'Naive Baseline'
  },
  datasetVersion: {
    type: String,
    default: 'v1.0'
  },
  supplier: {
    type: String,
    default: 'Unassigned Supplier'
  },
  isDemo: {
    type: Boolean,
    default: false
  },
  demandHistory: {
    type: [{
      date: String,
      qty: Number
    }],
    default: []
  }
}, {
  timestamps: true
});

productSchema.index({ companyId: 1, datasetId: 1, sku: 1 }, { unique: true });
productSchema.index({ companyId: 1, datasetId: 1 });
productSchema.index({ companyId: 1, category: 1 });
productSchema.index({ companyId: 1, riskLevel: 1 });

module.exports = mongoose.model('Product', productSchema);
