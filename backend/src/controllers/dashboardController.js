const Product = require('../models/Product');
const Dataset = require('../models/Dataset');
const Recommendation = require('../models/Recommendation');
const ActivityLog = require('../models/ActivityLog');
const ForecastResult = require('../models/ForecastResult');

const dashboardController = {
  getSummary: async (req, res, next) => {
    try {
      const companyId = req.companyId;

      const allDatasets = await Dataset.find({
        companyId,
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
          hasData: false,
          datasetId: null,
          datasetName: 'No Dataset Selected',
          datasetVersion: 'None',
          datasets: [],
          categories: ['All'],
          totalSkus: 0,
          historicalSalesVolume: '0 units',
          productsAtRiskCount: 0,
          forecastCoverage: '0%',
          pendingRecommendationsCount: 0,
          timeSeriesChartData: [],
          riskDistribution: [
            { name: "Healthy Stock", value: 0, color: "#10b981" },
            { name: "Stockout Risk", value: 0, color: "#ef4444" },
            { name: "Overstock Risk", value: 0, color: "#f59e0b" }
          ],
          topProductsAttention: [],
          prototypeInsights: [
            {
              id: "ins-0",
              sku: "CATALOG-EMPTY",
              category: "Onboarding",
              title: "No Dataset Uploaded Yet",
              text: "Welcome to CogniStock! Please upload your historical sales CSV or Excel file via 'Upload Data' to trigger demand forecasting and inventory intelligence."
            }
          ],
          recentActivity: []
        });
      }

      const datasetList = allDatasets.map((d) => ({
        id: d._id,
        name: d.name,
        version: d.currentVersion || 'v1.0',
        createdAt: d.createdAt
      }));

      const products = await Product.find({ companyId, datasetId: datasetDoc._id });

      if (products.length === 0) {
        return res.json({
          hasData: false,
          datasetId: datasetDoc._id,
          datasetName: datasetDoc.name,
          datasetVersion: datasetDoc.currentVersion || 'v1.0',
          datasets: datasetList,
          categories: ['All'],
          totalSkus: 0,
          historicalSalesVolume: '0 units',
          productsAtRiskCount: 0,
          forecastCoverage: '0%',
          pendingRecommendationsCount: 0,
          timeSeriesChartData: [],
          riskDistribution: [
            { name: "Healthy Stock", value: 0, color: "#10b981" },
            { name: "Stockout Risk", value: 0, color: "#ef4444" },
            { name: "Overstock Risk", value: 0, color: "#f59e0b" }
          ],
          topProductsAttention: [],
          prototypeInsights: [
            {
              id: "ins-empty",
              sku: "EMPTY-DATASET",
              category: "Notice",
              title: `Dataset '${datasetDoc.name}' Has No Products`,
              text: "No products are indexed under this dataset. Confirm file import or select another dataset."
            }
          ],
          recentActivity: []
        });
      }

      const totalSkus = products.length;
      let totalSalesVolume = 0;
      let stockoutCount = 0;
      let overstockCount = 0;
      let healthyCount = 0;
      const categoriesSet = new Set(['All']);

      products.forEach((p) => {
        if (p.category) categoriesSet.add(p.category);
        if (p.demandHistory && p.demandHistory.length > 0) {
          totalSalesVolume += p.demandHistory.reduce((acc, h) => acc + (Number(h.qty) || 0), 0);
        } else {
          totalSalesVolume += (p.averageDailyDemand || 0) * 90;
        }

        if (p.riskLevel === 'High Risk' || p.riskLevel === 'Medium Risk') {
          stockoutCount++;
        } else if (p.riskLevel === 'Overstock') {
          overstockCount++;
        } else {
          healthyCount++;
        }
      });

      const productsAtRiskCount = stockoutCount + overstockCount;
      const pendingRecommendationsCount = await Recommendation.countDocuments({
        companyId,
        datasetId: datasetDoc._id,
        status: 'Needs Review'
      });

      // Find real forecast or historical series for primary product
      const primarySku = products[0]?.sku;
      const forecastResult = await ForecastResult.findOne({
        companyId,
        datasetId: datasetDoc._id,
        sku: primarySku
      }).sort({ createdAt: -1 });

      let timeSeriesChartData = [];
      if (forecastResult && forecastResult.series && forecastResult.series.length > 0) {
        timeSeriesChartData = forecastResult.series;
      } else if (products[0]?.demandHistory && products[0].demandHistory.length > 0) {
        // Use genuine historical observations from the product
        timeSeriesChartData = products[0].demandHistory.map((h) => ({
          date: h.date,
          demand: Number(h.qty),
          forecast: null,
          isForecast: false
        }));
      }

      // Count SKUs that have actual forecast results
      const forecastedCount = await ForecastResult.distinct('sku', {
        companyId,
        datasetId: datasetDoc._id
      });
      const forecastCoveragePct = totalSkus > 0
        ? `${Math.round((forecastedCount.length / totalSkus) * 100)}%`
        : '0%';

      // Top Attention Products: high risk or highest recommendedQty
      const topProductsAttention = await Product.find({
        companyId,
        datasetId: datasetDoc._id
      })
        .sort({ recommendedQty: -1, riskLevel: 1 })
        .limit(5);

      // Recent Activity scoped to company
      const recentActivity = await ActivityLog.find({ companyId })
        .sort({ createdAt: -1 })
        .limit(5);

      // Insights based on real products
      const prototypeInsights = [];
      const criticalProduct = products.find((p) => p.riskLevel === 'High Risk');
      if (criticalProduct) {
        prototypeInsights.push({
          id: `ins-${criticalProduct.sku}`,
          sku: criticalProduct.sku,
          category: criticalProduct.category,
          title: `Imminent Stockout Risk on ${criticalProduct.sku}`,
          text: `${criticalProduct.name} current stock (${criticalProduct.currentStock ?? 'N/A'}) has breached safety threshold (${criticalProduct.safetyStock ?? 'N/A'}). Recommended order of ${criticalProduct.recommendedQty} units awaiting review.`
        });
      }

      const overstockProduct = products.find((p) => p.riskLevel === 'Overstock');
      if (overstockProduct) {
        prototypeInsights.push({
          id: `ins-${overstockProduct.sku}`,
          sku: overstockProduct.sku,
          category: overstockProduct.category,
          title: `Overstock Alert for ${overstockProduct.sku}`,
          text: `${overstockProduct.name} holding position (${overstockProduct.currentStock} units) exceeds target inventory level (${overstockProduct.targetInventory}). Reduce replenishment to free working capital.`
        });
      }

      if (prototypeInsights.length === 0 && products.length > 0) {
        prototypeInsights.push({
          id: `ins-${products[0].sku}`,
          sku: products[0].sku,
          category: products[0].category,
          title: `Primary SKU: ${products[0].sku} (${products[0].name})`,
          text: `Demand projections generated with ${products[0].modelUsed || 'Naive Baseline'}. 30-day forecasted demand is ${products[0].forecastDemand30d || 0} units.`
        });
      }

      res.json({
        hasData: true,
        datasetId: datasetDoc._id,
        datasetName: datasetDoc.name,
        datasetVersion: datasetDoc.currentVersion || 'v1.0',
        datasets: datasetList,
        categories: Array.from(categoriesSet),
        primarySku: products[0]?.sku,
        primaryProductName: products[0]?.name,
        totalSkus,
        historicalSalesVolume: `${(totalSalesVolume / 1000).toFixed(1)}k units`,
        productsAtRiskCount,
        forecastCoverage: forecastCoveragePct,
        pendingRecommendationsCount,
        timeSeriesChartData,
        riskDistribution: [
          { name: "Healthy Buffer", value: healthyCount, color: "#10b981" },
          { name: "Stockout Risk", value: stockoutCount, color: "#ef4444" },
          { name: "Overstock Risk", value: overstockCount, color: "#f59e0b" }
        ],
        topProductsAttention: topProductsAttention.map((p) => ({
          sku: p.sku,
          name: p.name,
          currentStock: p.currentStock ?? 'Not provided',
          forecastDemand30d: p.forecastDemand30d,
          riskLevel: p.riskLevel,
          recommendedQty: p.recommendedQty
        })),
        prototypeInsights,
        recentActivity
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = dashboardController;
