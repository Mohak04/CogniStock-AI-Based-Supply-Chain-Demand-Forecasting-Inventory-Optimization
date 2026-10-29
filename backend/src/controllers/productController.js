const Product = require('../models/Product');
const ForecastResult = require('../models/ForecastResult');

const productController = {
  getProducts: async (req, res, next) => {
    try {
      const { category, riskLevel, search } = req.query;
      const query = { companyId: req.companyId };

      if (req.query.datasetId && req.query.datasetId !== 'all') {
        query.datasetId = req.query.datasetId;
      }
      if (category && category !== 'All') {
        query.category = category;
      }
      if (riskLevel && riskLevel !== 'All') {
        query.riskLevel = riskLevel;
      }
      if (search && search.trim()) {
        const q = search.trim();
        query.$or = [
          { sku: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } }
        ];
      }

      const products = await Product.find(query).sort({ sku: 1 });

      const forecastQuery = {
        companyId: req.companyId,
        sku: { $in: products.map((p) => p.sku) }
      };
      if (query.datasetId) forecastQuery.datasetId = query.datasetId;

      const forecastResults = await ForecastResult.find(forecastQuery).sort({ createdAt: -1 });
      const modelMap = {};
      forecastResults.forEach((fr) => {
        if (!modelMap[fr.sku]) {
          modelMap[fr.sku] = fr.selectedModel;
        }
      });

      res.json({
        status: 'success',
        data: products.map((p) => ({
          id: p._id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          unitPrice: p.unitPrice ? `$${p.unitPrice.toFixed(2)}` : 'Not provided',
          unitCost: p.unitCost ? `$${p.unitCost.toFixed(2)}` : 'Not provided',
          currentStock: p.currentStock ?? 'Not provided',
          leadTimeDays: p.leadTimeDays ?? 'Not provided',
          safetyStock: p.safetyStock ?? 'Not provided',
          reorderPoint: p.reorderPoint ?? 'Not provided',
          recommendedQty: p.recommendedQty ?? 0,
          riskLevel: p.riskLevel || 'Unavailable',
          riskReason: p.riskReason,
          demandTrend: p.demandTrend,
          variability: p.variability,
          seasonality: p.seasonality,
          averageDailyDemand: p.averageDailyDemand,
          forecastDemand30d: p.forecastDemand30d,
          modelUsed: modelMap[p.sku] || p.modelUsed || 'Naive Baseline',
          datasetVersion: p.datasetVersion,
          supplier: p.supplier
        }))
      });
    } catch (err) {
      next(err);
    }
  },

  getProductBySku: async (req, res, next) => {
    try {
      const sku = req.params.sku.toUpperCase();
      const query = { companyId: req.companyId, sku };
      if (req.query.datasetId) {
        query.datasetId = req.query.datasetId;
      }
      const product = await Product.findOne(query);

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: `Product with SKU '${sku}' not found.`
        });
      }

      res.json({
        status: 'success',
        data: {
          id: product._id,
          sku: product.sku,
          name: product.name,
          category: product.category,
          unitPrice: product.unitPrice ? `$${product.unitPrice.toFixed(2)}` : 'Not provided',
          unitCost: product.unitCost ? `$${product.unitCost.toFixed(2)}` : 'Not provided',
          leadTimeDays: product.leadTimeDays ?? 14,
          currentStock: product.currentStock ?? 0,
          onOrder: product.onOrder || 0,
          backorders: product.backorders || 0,
          safetyStock: product.safetyStock ?? 0,
          reorderPoint: product.reorderPoint ?? 0,
          targetInventory: product.targetInventory ?? 0,
          inventoryPosition: (product.currentStock || 0) + (product.onOrder || 0) - (product.backorders || 0),
          recommendedQty: product.recommendedQty ?? 0,
          riskLevel: product.riskLevel,
          riskReason: product.riskReason,
          demandTrend: product.demandTrend,
          variability: product.variability,
          seasonality: product.seasonality,
          averageDailyDemand: product.averageDailyDemand,
          forecastDemand30d: product.forecastDemand30d,
          modelUsed: product.modelUsed,
          datasetVersion: product.datasetVersion,
          supplier: product.supplier,
          lastUpdated: product.updatedAt ? product.updatedAt.toISOString().slice(0, 10) : 'Recent'
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = productController;
