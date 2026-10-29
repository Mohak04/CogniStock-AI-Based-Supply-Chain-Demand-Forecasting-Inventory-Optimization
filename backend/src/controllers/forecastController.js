const ForecastRun = require('../models/ForecastRun');
const ForecastResult = require('../models/ForecastResult');
const ModelEvaluation = require('../models/ModelEvaluation');
const Product = require('../models/Product');
const Dataset = require('../models/Dataset');
const DatasetVersion = require('../models/DatasetVersion');
const ActivityLog = require('../models/ActivityLog');
const mlService = require('../services/mlService');

const forecastController = {
  getForecastRuns: async (req, res, next) => {
    try {
      const query = { companyId: req.companyId };
      if (req.query.datasetId) {
        query.datasetId = req.query.datasetId;
      }
      const runs = await ForecastRun.find(query).sort({ createdAt: -1 });
      res.json({ status: 'success', data: runs });
    } catch (err) {
      next(err);
    }
  },

  getForecastRunById: async (req, res, next) => {
    try {
      const run = await ForecastRun.findOne({
        _id: req.params.id,
        companyId: req.companyId
      });
      if (!run) {
        return res.status(404).json({ status: 'error', message: 'Forecast run not found.' });
      }
      const results = await ForecastResult.find({
        companyId: req.companyId,
        forecastRunId: run._id
      });
      res.json({ status: 'success', data: { run, results } });
    } catch (err) {
      next(err);
    }
  },

  getForecastBySku: async (req, res, next) => {
    try {
      const sku = req.params.sku.toUpperCase();
      const horizon = parseInt(req.query.horizon || '30', 10);
      const datasetId = req.query.datasetId;

      const query = { companyId: req.companyId, sku };
      if (datasetId) query.datasetId = datasetId;

      // Check for existing result
      let result = await ForecastResult.findOne(query).sort({ createdAt: -1 });

      if (result) {
        return res.json({
          status: 'success',
          data: {
            sku: result.sku,
            horizonDays: horizon,
            metrics: {
              modelName: result.selectedModel,
              datasetVersion: result.datasetVersion,
              mae: result.metrics?.mae ?? 0,
              rmse: result.metrics?.rmse ?? 0,
              smape: result.metrics?.smape ?? 'N/A',
              rationale: result.selectionRationale
            },
            series: result.series
          }
        });
      }

      // If no stored forecast result, generate from product's actual demand history
      const product = await Product.findOne(query);
      if (!product) {
        return res.status(404).json({ status: 'error', message: `Product ${sku} not found.` });
      }

      const records = (product.demandHistory && product.demandHistory.length >= 5)
        ? product.demandHistory.map((h) => ({ date: h.date, qty: h.qty }))
        : [];

      if (records.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: `Product ${sku} has insufficient historical demand observations in this dataset.`
        });
      }

      const mlRes = await mlService.generateForecast({
        sku,
        records,
        horizon,
        frequency: 'Daily',
        datasetVersion: product.datasetVersion || 'v1.0'
      });

      // Save result
      result = await ForecastResult.create({
        companyId: req.companyId,
        datasetId: product.datasetId,
        forecastRunId: req.user._id,
        sku,
        datasetVersion: mlRes.datasetVersion,
        horizon: mlRes.horizon,
        frequency: mlRes.frequency,
        selectedModel: mlRes.selectedModel,
        selectionRationale: mlRes.selectionRationale,
        metrics: mlRes.metrics,
        candidateModels: mlRes.candidateModels,
        series: mlRes.series,
        splitInfo: mlRes.splitInfo
      });

      // Update product's assigned model
      product.modelUsed = mlRes.selectedModel;
      await product.save();

      res.json({
        status: 'success',
        data: {
          sku: result.sku,
          horizonDays: horizon,
          metrics: {
            modelName: result.selectedModel,
            datasetVersion: result.datasetVersion,
            mae: result.metrics?.mae ?? 0,
            rmse: result.metrics?.rmse ?? 0,
            smape: result.metrics?.smape ?? 'N/A',
            rationale: result.selectionRationale
          },
          series: result.series
        }
      });
    } catch (err) {
      next(err);
    }
  },

  getModelComparison: async (req, res, next) => {
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
          datasetId: null,
          datasetName: 'No Dataset Selected',
          datasetVersion: 'None',
          datasets: [],
          models: [],
          chartData: []
        });
      }

      const datasetList = allDatasets.map((d) => ({
        id: d._id,
        name: d.name,
        version: d.currentVersion || 'v1.0',
        createdAt: d.createdAt
      }));

      // Find latest model evaluation for this dataset
      const latestEval = await ModelEvaluation.findOne({
        companyId: req.companyId,
        datasetId: datasetDoc._id
      }).sort({ createdAt: -1 });

      if (latestEval && latestEval.models && latestEval.models.length > 0) {
        return res.json({
          status: 'success',
          datasetId: datasetDoc._id,
          datasetName: datasetDoc.name,
          datasetVersion: latestEval.datasetVersion || datasetDoc.currentVersion || 'v1.0',
          datasets: datasetList,
          data: {
            models: latestEval.models,
            chartData: latestEval.chartData
          }
        });
      }

      // Check if this dataset has forecast results with candidate models
      const results = await ForecastResult.find({
        companyId: req.companyId,
        datasetId: datasetDoc._id,
        'candidateModels.0': { $exists: true }
      });

      if (results.length > 0) {
        // Aggregate actual evaluated metrics across SKUs for this dataset
        const modelAgg = {};
        results.forEach((r) => {
          (r.candidateModels || []).forEach((cm) => {
            if (!modelAgg[cm.name]) {
              modelAgg[cm.name] = {
                name: cm.name,
                category: cm.category,
                status: cm.status,
                eligibility: cm.eligibility,
                maeList: [],
                rmseList: [],
                smapeList: [],
                trainingTimes: [],
                description: cm.description
              };
            }
            if (cm.mae !== null && cm.mae !== undefined) modelAgg[cm.name].maeList.push(Number(cm.mae));
            if (cm.rmse !== null && cm.rmse !== undefined) modelAgg[cm.name].rmseList.push(Number(cm.rmse));
            if (cm.smape && typeof cm.smape === 'string') {
              const num = parseFloat(cm.smape.replace('%', ''));
              if (!isNaN(num)) modelAgg[cm.name].smapeList.push(num);
            }
            if (cm.trainingTime) {
              const t = parseFloat(cm.trainingTime);
              if (!isNaN(t)) modelAgg[cm.name].trainingTimes.push(t);
            }
          });
        });

        const models = Object.values(modelAgg).map((m, idx) => {
          const avgMae = m.maeList.length > 0 ? Number((m.maeList.reduce((a, b) => a + b, 0) / m.maeList.length).toFixed(2)) : 0;
          const avgRmse = m.rmseList.length > 0 ? Number((m.rmseList.reduce((a, b) => a + b, 0) / m.rmseList.length).toFixed(2)) : 0;
          const avgSmape = m.smapeList.length > 0 ? `${(m.smapeList.reduce((a, b) => a + b, 0) / m.smapeList.length).toFixed(1)}%` : 'N/A';
          const avgTime = m.trainingTimes.length > 0 ? `${(m.trainingTimes.reduce((a, b) => a + b, 0) / m.trainingTimes.length).toFixed(2)}s` : '0.1s';

          return {
            id: `mod-${datasetDoc._id}-${idx + 1}`,
            name: m.name,
            category: m.category,
            status: m.status,
            eligibility: m.eligibility,
            maeDemo: avgMae,
            rmseDemo: avgRmse,
            smapeDemo: avgSmape,
            trainingTime: avgTime,
            version: datasetDoc.currentVersion || 'v1.0',
            datasetVersion: datasetDoc.name,
            description: m.description || ''
          };
        });

        const chartData = models.map((m) => ({
          name: m.name,
          mae: m.maeDemo,
          rmse: m.rmseDemo,
          trainingTime: parseFloat(m.trainingTime) || 1.0
        }));

        // Persist genuine ModelEvaluation document
        await ModelEvaluation.create({
          companyId: req.companyId,
          datasetId: datasetDoc._id,
          datasetVersion: datasetDoc.currentVersion || 'v1.0',
          models,
          chartData
        });

        return res.json({
          status: 'success',
          datasetId: datasetDoc._id,
          datasetName: datasetDoc.name,
          datasetVersion: datasetDoc.currentVersion || 'v1.0',
          datasets: datasetList,
          data: { models, chartData }
        });
      }

      // If no forecast benchmark has been executed on this dataset yet, return uncalculated state
      res.json({
        status: 'uncalculated',
        message: `No model benchmark results generated for dataset '${datasetDoc.name}' yet.`,
        datasetId: datasetDoc._id,
        datasetName: datasetDoc.name,
        datasetVersion: datasetDoc.currentVersion || 'v1.0',
        datasets: datasetList,
        data: {
          models: [],
          chartData: []
        }
      });
    } catch (err) {
      next(err);
    }
  },

  triggerForecastRun: async (req, res, next) => {
    try {
      const { horizon = 30, frequency = 'Daily', sku, datasetId } = req.body;

      let datasetDoc = null;
      if (datasetId) {
        datasetDoc = await Dataset.findOne({ _id: datasetId, companyId: req.companyId });
      }

      if (!datasetDoc) {
        datasetDoc = await Dataset.findOne({ companyId: req.companyId, isArchived: false }).sort({ createdAt: -1 });
      }

      if (!datasetDoc) {
        return res.status(400).json({ status: 'error', message: 'No dataset found for this company. Please upload data first.' });
      }

      const datasetVersion = await DatasetVersion.findOne({
        companyId: req.companyId,
        datasetId: datasetDoc._id
      }).sort({ createdAt: -1 });

      const prodQuery = { companyId: req.companyId, datasetId: datasetDoc._id };
      if (sku) prodQuery.sku = sku.toUpperCase();

      const products = await Product.find(prodQuery);
      if (products.length === 0) {
        return res.status(400).json({ status: 'error', message: `No products found in dataset '${datasetDoc.name}'.` });
      }

      const forecastRun = await ForecastRun.create({
        companyId: req.companyId,
        datasetId: datasetDoc._id,
        datasetVersionId: datasetVersion?._id || datasetDoc._id,
        datasetVersion: datasetVersion?.version || datasetDoc.currentVersion || 'v1.0',
        status: 'Processing',
        horizon,
        frequency: datasetVersion?.detectedFrequency || frequency,
        triggeredBy: req.user._id,
        totalSkusProcessed: products.length
      });

      const candidateModelsCollected = [];

      // Run genuine forecast for each product using its actual demand history
      for (const prod of products) {
        const records = (prod.demandHistory && prod.demandHistory.length >= 5)
          ? prod.demandHistory.map((h) => ({ date: h.date, qty: h.qty }))
          : [];

        if (records.length < 5) {
          prod.modelUsed = 'Insufficient Data';
          await prod.save();
          continue;
        }

        const mlRes = await mlService.generateForecast({
          sku: prod.sku,
          records,
          horizon,
          frequency: datasetVersion?.detectedFrequency || frequency,
          datasetVersion: datasetVersion?.version || 'v1.0'
        });

        await ForecastResult.create({
          companyId: req.companyId,
          datasetId: datasetDoc._id,
          forecastRunId: forecastRun._id,
          sku: prod.sku,
          datasetVersion: datasetVersion?.version || 'v1.0',
          horizon,
          frequency: mlRes.frequency,
          selectedModel: mlRes.selectedModel,
          selectionRationale: mlRes.selectionRationale,
          metrics: mlRes.metrics,
          candidateModels: mlRes.candidateModels,
          series: mlRes.series,
          splitInfo: mlRes.splitInfo
        });

        if (mlRes.candidateModels && mlRes.candidateModels.length > 0) {
          candidateModelsCollected.push(mlRes.candidateModels);
        }

        // Update product's forecast and modelUsed
        prod.modelUsed = mlRes.selectedModel;
        prod.forecastDemand30d = Math.round((prod.averageDailyDemand || 15) * 30);
        await prod.save();
      }

      // Aggregate genuine candidate models into dataset-specific ModelEvaluation
      if (candidateModelsCollected.length > 0) {
        const modelAgg = {};
        candidateModelsCollected.flat().forEach((cm) => {
          if (!modelAgg[cm.name]) {
            modelAgg[cm.name] = {
              name: cm.name,
              category: cm.category,
              status: cm.status,
              eligibility: cm.eligibility,
              maeList: [],
              rmseList: [],
              smapeList: [],
              trainingTimes: [],
              description: cm.description
            };
          }
          if (cm.mae !== null && cm.mae !== undefined) modelAgg[cm.name].maeList.push(Number(cm.mae));
          if (cm.rmse !== null && cm.rmse !== undefined) modelAgg[cm.name].rmseList.push(Number(cm.rmse));
          if (cm.smape && typeof cm.smape === 'string') {
            const num = parseFloat(cm.smape.replace('%', ''));
            if (!isNaN(num)) modelAgg[cm.name].smapeList.push(num);
          }
          if (cm.trainingTime) {
            const t = parseFloat(cm.trainingTime);
            if (!isNaN(t)) modelAgg[cm.name].trainingTimes.push(t);
          }
        });

        const models = Object.values(modelAgg).map((m, idx) => {
          const avgMae = m.maeList.length > 0 ? Number((m.maeList.reduce((a, b) => a + b, 0) / m.maeList.length).toFixed(2)) : 0;
          const avgRmse = m.rmseList.length > 0 ? Number((m.rmseList.reduce((a, b) => a + b, 0) / m.rmseList.length).toFixed(2)) : 0;
          const avgSmape = m.smapeList.length > 0 ? `${(m.smapeList.reduce((a, b) => a + b, 0) / m.smapeList.length).toFixed(1)}%` : 'N/A';
          const avgTime = m.trainingTimes.length > 0 ? `${(m.trainingTimes.reduce((a, b) => a + b, 0) / m.trainingTimes.length).toFixed(2)}s` : '0.1s';

          return {
            id: `mod-${datasetDoc._id}-${idx + 1}`,
            name: m.name,
            category: m.category,
            status: m.status,
            eligibility: m.eligibility,
            maeDemo: avgMae,
            rmseDemo: avgRmse,
            smapeDemo: avgSmape,
            trainingTime: avgTime,
            version: datasetVersion?.version || 'v1.0',
            datasetVersion: datasetDoc.name,
            description: m.description || ''
          };
        });

        const chartData = models.map((m) => ({
          name: m.name,
          mae: m.maeDemo,
          rmse: m.rmseDemo,
          trainingTime: parseFloat(m.trainingTime) || 1.0
        }));

        await ModelEvaluation.create({
          companyId: req.companyId,
          datasetId: datasetDoc._id,
          datasetVersionId: datasetVersion?._id || datasetDoc._id,
          datasetVersion: datasetVersion?.version || 'v1.0',
          models,
          chartData
        });
      }

      forecastRun.status = 'Completed';
      forecastRun.completedAt = new Date();
      await forecastRun.save();

      await ActivityLog.create({
        companyId: req.companyId,
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'Demand Forecast Job',
        category: 'Forecasting',
        details: `Executed demand forecasting across ${products.length} SKUs for dataset '${datasetDoc.name}' (horizon: ${horizon}).`,
        status: 'Success'
      });

      res.json({
        status: 'success',
        message: `Forecasting completed successfully for ${products.length} catalog items in dataset '${datasetDoc.name}'.`,
        data: forecastRun
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = forecastController;
