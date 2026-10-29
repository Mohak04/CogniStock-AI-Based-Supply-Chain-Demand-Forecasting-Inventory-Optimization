const Product = require('../models/Product');
const Recommendation = require('../models/Recommendation');
const Dataset = require('../models/Dataset');
const ActivityLog = require('../models/ActivityLog');
const { calculateInventoryMetrics } = require('../services/inventoryEngine');

const inventoryController = {
  getInventoryOverview: async (req, res, next) => {
    try {
      const allDatasets = await Dataset.find({
        companyId: req.companyId,
        isArchived: false
      }).sort({ createdAt: -1 });

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
          data: {
            hasData: false,
            datasetId: null,
            datasetName: 'No Dataset Available',
            datasetVersion: 'None',
            datasets: [],
            summary: {
              totalSkus: 0,
              totalCatalogSkus: 0,
              stockoutRiskCount: 0,
              overstockRiskCount: 0,
              healthyBufferCount: 0,
              replenishmentCandidates: 0,
              totalInventoryValue: '$0.0k'
            },
            calculations: {
              avgLeadTimeDays: 0,
              serviceLevelConfidence: "95% (Z = 1.65)",
              policyRule: "Continuous Review (s, S) with Safety Buffer",
              lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ')
            },
            items: []
          }
        });
      }

      const products = await Product.find({
        companyId: req.companyId,
        datasetId: datasetDoc._id
      }).sort({ recommendedQty: -1 });

      let stockoutCount = 0;
      let overstockCount = 0;
      let healthyCount = 0;
      let totalInvVal = 0;

      products.forEach((p) => {
        if (p.riskLevel === 'High Risk' || p.riskLevel === 'Medium Risk') stockoutCount++;
        else if (p.riskLevel === 'Overstock') overstockCount++;
        else healthyCount++;

        if (p.currentStock && p.unitCost) {
          totalInvVal += p.currentStock * p.unitCost;
        }
      });

      const summary = {
        totalSkus: products.length,
        totalCatalogSkus: products.length,
        stockoutRiskCount: stockoutCount,
        overstockRiskCount: overstockCount,
        healthyBufferCount: healthyCount,
        replenishmentCandidates: products.filter((p) => (p.recommendedQty || 0) > 0).length,
        totalInventoryValue: totalInvVal > 0 ? `$${(totalInvVal / 1000).toFixed(1)}k` : '$0.0k'
      };

      const calculations = {
        avgLeadTimeDays: products.length > 0
          ? Math.round(products.reduce((acc, p) => acc + (p.leadTimeDays || 14), 0) / products.length)
          : 14,
        serviceLevelConfidence: "95% (Z = 1.65)",
        policyRule: "Continuous Review (s, S) with Safety Buffer",
        lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      res.json({
        status: 'success',
        data: {
          hasData: products.length > 0,
          datasetId: datasetDoc._id,
          datasetName: datasetDoc.name,
          datasetVersion: datasetDoc.currentVersion || 'v1.0',
          datasets: allDatasets.map((d) => ({
            id: d._id,
            name: d.name,
            version: d.currentVersion || 'v1.0',
            createdAt: d.createdAt
          })),
          summary,
          calculations,
          items: products.map((p) => ({
            id: p._id,
            sku: p.sku,
            name: p.name,
            category: p.category,
            currentStock: p.currentStock ?? 0,
            forecastDemand30d: p.forecastDemand30d ?? 0,
            leadTimeDays: p.leadTimeDays ?? 14,
            safetyStock: p.safetyStock ?? 0,
            reorderPoint: p.reorderPoint ?? 0,
            inventoryPosition: (p.currentStock || 0) + (p.onOrder || 0) - (p.backorders || 0),
            recommendedQty: p.recommendedQty ?? 0,
            riskLevel: p.riskLevel || 'Low Risk',
            unitPrice: p.unitPrice,
            unitCost: p.unitCost,
            onOrder: p.onOrder || 0
          }))
        }
      });
    } catch (err) {
      next(err);
    }
  },

  updateProductInventory: async (req, res, next) => {
    try {
      const sku = req.params.sku.toUpperCase();
      const { currentStock, onOrder, leadTimeDays, unitCost, datasetId } = req.body;

      const query = { companyId: req.companyId, sku };
      if (datasetId) query.datasetId = datasetId;

      const product = await Product.findOne(query);
      if (!product) {
        return res.status(404).json({ status: 'error', message: `Product ${sku} not found in selected dataset.` });
      }

      if (currentStock !== undefined) product.currentStock = Number(currentStock);
      if (onOrder !== undefined) product.onOrder = Number(onOrder);
      if (leadTimeDays !== undefined) product.leadTimeDays = Number(leadTimeDays);
      if (unitCost !== undefined) product.unitCost = Number(unitCost);

      // Recompute deterministic inventory metrics using product's actual demand history if available
      // Recompute deterministic inventory metrics using product's actual demand history
      const demandValues = (product.demandHistory && product.demandHistory.length > 0)
        ? product.demandHistory.map((h) => Number(h.qty) || 0)
        : [];

      const invCalc = calculateInventoryMetrics({
        demandHistory: demandValues,
        leadTimeDays: product.leadTimeDays,
        currentStock: product.currentStock,
        onOrder: product.onOrder,
        backorders: product.backorders,
        unitCost: product.unitCost
      });

      product.safetyStock = invCalc.safetyStock;
      product.reorderPoint = invCalc.reorderPoint;
      product.targetInventory = invCalc.targetInventoryLevel;
      product.recommendedQty = invCalc.recommendedQty;
      product.riskLevel = invCalc.riskLevel;
      product.riskReason = invCalc.riskReason;

      await product.save();

      // Upsert or clear recommendation for this dataset
      if (product.recommendedQty > 0) {
        await Recommendation.findOneAndUpdate(
          { companyId: req.companyId, datasetId: product.datasetId, sku: product.sku },
          {
            companyId: req.companyId,
            datasetId: product.datasetId,
            datasetVersionId: product.datasetVersionId,
            sku: product.sku,
            productName: product.name,
            category: product.category,
            priority: product.riskLevel === 'High Risk' ? 'High Priority' : 'Normal',
            recommendedQty: product.recommendedQty,
            currentStock: product.currentStock,
            reorderPoint: product.reorderPoint,
            safetyStock: product.safetyStock,
            leadTimeDays: product.leadTimeDays,
            inventoryPosition: (product.currentStock || 0) + (product.onOrder || 0),
            targetInventory: product.targetInventory,
            unitCost: product.unitCost,
            estimatedOrderCost: product.unitCost ? product.recommendedQty * product.unitCost : null,
            status: 'Needs Review',
            datasetVersion: product.datasetVersion || 'v1.0'
          },
          { upsert: true }
        );
      } else {
        await Recommendation.deleteOne({
          companyId: req.companyId,
          datasetId: product.datasetId,
          sku: product.sku
        });
      }

      await ActivityLog.create({
        companyId: req.companyId,
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'Inventory Stock Update',
        category: 'Inventory',
        details: `Adjusted inventory inputs for ${sku}: CurrentStock=${product.currentStock}, LeadTime=${product.leadTimeDays}d. New ROP=${product.reorderPoint}, Recommended=${product.recommendedQty} units.`,
        status: 'Success'
      });

      res.json({
        status: 'success',
        message: 'Product inventory updated and replenishment parameters recalculated.',
        product
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = inventoryController;
