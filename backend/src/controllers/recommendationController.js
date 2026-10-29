const Recommendation = require('../models/Recommendation');
const Product = require('../models/Product');
const Dataset = require('../models/Dataset');
const ActivityLog = require('../models/ActivityLog');

const recommendationController = {
  getRecommendations: async (req, res, next) => {
    try {
      const allDatasets = await Dataset.find({
        companyId: req.companyId,
        isArchived: false
      }).sort({ createdAt: -1 });

      const priorityFilter = req.query.priority || 'All';
      let datasetId = req.query.datasetId;
      let datasetDoc = null;

      if (datasetId && datasetId !== 'all') {
        datasetDoc = allDatasets.find((d) => d._id.toString() === datasetId.toString());
      }

      if (!datasetDoc && allDatasets.length > 0) {
        datasetDoc = allDatasets[0];
      }

      if (!datasetDoc) {
        return res.json({
          status: 'success',
          datasetId: null,
          datasetName: 'No Dataset Selected',
          datasets: [],
          data: []
        });
      }

      const query = { companyId: req.companyId, datasetId: datasetDoc._id };

      if (priorityFilter !== 'All') {
        query.priority = priorityFilter;
      }

      const recs = await Recommendation.find(query).sort({
        status: 1, // Needs Review first
        recommendedQty: -1
      });

      res.json({
        status: 'success',
        datasetId: datasetDoc._id,
        datasetName: datasetDoc.name,
        datasetVersion: datasetDoc.currentVersion || 'v1.0',
        datasets: allDatasets.map((d) => ({
          id: d._id,
          name: d.name,
          version: d.currentVersion || 'v1.0',
          createdAt: d.createdAt
        })),
        data: recs.map((r) => ({
          id: r._id,
          sku: r.sku,
          productName: r.productName,
          category: r.category,
          priority: r.priority,
          status: r.status,
          recommendedQty: r.recommendedQty,
          currentStock: r.currentStock,
          reorderPoint: r.reorderPoint,
          safetyStock: r.safetyStock,
          leadTimeDays: r.leadTimeDays,
          inventoryPosition: r.inventoryPosition,
          targetInventory: r.targetInventory,
          unitCost: r.unitCost,
          estimatedCost: r.estimatedOrderCost ? `$${r.estimatedOrderCost.toLocaleString()}` : 'N/A',
          notes: r.notes || '',
          reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString().slice(0, 16).replace('T', ' ') : null,
          rationale: `Derived via deterministic formula: Target Inventory (${r.targetInventory}) - Position (${r.inventoryPosition}).`
        }))
      });
    } catch (err) {
      next(err);
    }
  },

  updateRecommendationStatus: async (req, res, next) => {
    try {
      const { status, notes } = req.body;
      const validStatuses = ['Needs Review', 'Reviewed', 'Approved', 'Rejected'];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const rec = await Recommendation.findOne({
        _id: req.params.id,
        companyId: req.companyId
      });

      if (!rec) {
        return res.status(404).json({
          status: 'error',
          message: 'Recommendation not found or access denied.'
        });
      }

      const oldStatus = rec.status;
      rec.status = status;
      if (notes !== undefined) rec.notes = notes;
      rec.reviewedBy = req.user._id;
      rec.reviewedAt = new Date();
      await rec.save();

      // Audit Log for governance trail
      await ActivityLog.create({
        companyId: req.companyId,
        userId: req.user._id,
        userEmail: req.user.email,
        action: `Recommendation ${status}`,
        category: 'Inventory',
        details: `Recommendation for SKU '${rec.sku}' changed from '${oldStatus}' to '${status}'. Quantity: ${rec.recommendedQty} units. ${notes ? `Notes: "${notes}"` : ''}`,
        status: status === 'Approved' ? 'Success' : status === 'Rejected' ? 'Warning' : 'Info'
      });

      res.json({
        status: 'success',
        message: `Recommendation status changed to '${status}'.`,
        data: rec
      });
    } catch (err) {
      next(err);
    }
  },

  generateRecommendations: async (req, res, next) => {
    try {
      let { datasetId } = req.body;
      let datasetDoc = null;

      if (datasetId) {
        datasetDoc = await Dataset.findOne({ _id: datasetId, companyId: req.companyId });
      }

      if (!datasetDoc) {
        datasetDoc = await Dataset.findOne({ companyId: req.companyId, isArchived: false }).sort({ createdAt: -1 });
      }

      if (!datasetDoc) {
        return res.status(400).json({ status: 'error', message: 'No active dataset found.' });
      }

      const products = await Product.find({
        companyId: req.companyId,
        datasetId: datasetDoc._id,
        recommendedQty: { $gt: 0 }
      });

      let generatedCount = 0;
      for (const p of products) {
        await Recommendation.findOneAndUpdate(
          { companyId: req.companyId, datasetId: datasetDoc._id, sku: p.sku },
          {
            companyId: req.companyId,
            datasetId: datasetDoc._id,
            datasetVersionId: p.datasetVersionId,
            sku: p.sku,
            productName: p.name,
            category: p.category,
            priority: p.riskLevel === 'High Risk' ? 'High Priority' : 'Normal',
            recommendedQty: p.recommendedQty,
            currentStock: p.currentStock || 0,
            reorderPoint: p.reorderPoint || 0,
            safetyStock: p.safetyStock || 0,
            leadTimeDays: p.leadTimeDays || 14,
            inventoryPosition: (p.currentStock || 0) + (p.onOrder || 0),
            targetInventory: p.targetInventory || 0,
            unitCost: p.unitCost,
            estimatedOrderCost: p.unitCost ? p.recommendedQty * p.unitCost : null,
            status: 'Needs Review',
            datasetVersion: p.datasetVersion || 'v1.0'
          },
          { upsert: true, new: true }
        );
        generatedCount++;
      }

      await ActivityLog.create({
        companyId: req.companyId,
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'Recommendations Generated',
        category: 'Inventory',
        details: `Generated / refreshed ${generatedCount} replenishment recommendations for dataset '${datasetDoc.name}'.`,
        status: 'Success'
      });

      res.json({
        status: 'success',
        message: `Generated ${generatedCount} replenishment recommendations for ${datasetDoc.name}.`,
        datasetId: datasetDoc._id,
        count: generatedCount
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = recommendationController;
