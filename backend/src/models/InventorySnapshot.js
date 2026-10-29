const mongoose = require('mongoose');

const inventorySnapshotSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    index: true
  },
  snapshotDate: {
    type: Date,
    default: Date.now
  },
  totalSkus: {
    type: Number,
    default: 0
  },
  totalInventoryValue: {
    type: Number,
    default: 0
  },
  stockoutRiskCount: {
    type: Number,
    default: 0
  },
  overstockRiskCount: {
    type: Number,
    default: 0
  },
  healthyCount: {
    type: Number,
    default: 0
  },
  datasetVersion: {
    type: String,
    default: 'v1.0'
  }
}, {
  timestamps: true
});

inventorySnapshotSchema.index({ companyId: 1, snapshotDate: -1 });

module.exports = mongoose.model('InventorySnapshot', inventorySnapshotSchema);
