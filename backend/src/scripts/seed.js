const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const env = require('../config/env');
const { connectDB, closeDB } = require('../config/db');

// Models
const Company = require('../models/Company');
const User = require('../models/User');
const CompanySettings = require('../models/CompanySettings');
const Dataset = require('../models/Dataset');
const DatasetVersion = require('../models/DatasetVersion');
const Product = require('../models/Product');
const Recommendation = require('../models/Recommendation');
const ForecastRun = require('../models/ForecastRun');
const ForecastResult = require('../models/ForecastResult');
const ModelEvaluation = require('../models/ModelEvaluation');
const Report = require('../models/Report');
const ActivityLog = require('../models/ActivityLog');
const { calculateInventoryMetrics } = require('../services/inventoryEngine');
const { generateReportPDF } = require('../services/pdfService');

async function seed() {
  if (!env.DEMO_SEED_ENABLED) {
    console.log('[CogniStock Seed] DEMO_SEED_ENABLED is false. Skipping seed.');
    return;
  }

  console.log('[CogniStock Seed] Starting idempotent demo seeding...');
  await connectDB();

  const demoPassword = env.COGNISTOCK_DEMO_PASSWORD;
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(demoPassword, salt);

  // -------------------------------------------------------------
  // Company 1: Nova Retail Demo
  // -------------------------------------------------------------
  let novaCompany = await Company.findOne({ name: 'Nova Retail Demo' });
  if (!novaCompany) {
    novaCompany = await Company.create({
      name: 'Nova Retail Demo',
      industry: 'Multi-Category Retail & FMCG Distribution',
      tier: 'demo',
      isDemo: true
    });
  }

  // Users for Nova Retail
  await User.findOneAndUpdate(
    { email: 'admin@novaretail.demo' },
    {
      companyId: novaCompany._id,
      name: 'Nova Administrator',
      email: 'admin@novaretail.demo',
      passwordHash,
      role: 'company_admin',
      lastLogin: new Date()
    },
    { upsert: true, new: true }
  );

  const novaManager = await User.findOneAndUpdate(
    { email: 'manager@novaretail.demo' },
    {
      companyId: novaCompany._id,
      name: 'Inventory Manager',
      email: 'manager@novaretail.demo',
      passwordHash,
      role: 'inventory_manager',
      lastLogin: new Date()
    },
    { upsert: true, new: true }
  );

  // Settings for Nova Retail
  await CompanySettings.findOneAndUpdate(
    { companyId: novaCompany._id },
    {
      companyId: novaCompany._id,
      defaultForecastHorizon: 30,
      serviceLevelZ: 1.65,
      reviewPeriodDays: 7,
      leadTimeDaysDefault: 14,
      defaultModelFamily: 'XGBoost Regressor'
    },
    { upsert: true }
  );

  // Dataset & Version for Nova Retail
  let novaDataset = await Dataset.findOne({ companyId: novaCompany._id, name: 'Nova Retail Historical Sales — Demo' });
  if (!novaDataset) {
    novaDataset = await Dataset.create({
      companyId: novaCompany._id,
      name: 'Nova Retail Historical Sales — Demo',
      description: 'Historical multi-category sales records across 128 retail SKUs.',
      source: 'Nova_Retail_Sales_Demo.csv',
      currentVersion: 'v1.2',
      isDefault: true,
      isArchived: false
    });
  }

  const novaDatasetVersion = await DatasetVersion.findOneAndUpdate(
    { companyId: novaCompany._id, datasetId: novaDataset._id, version: 'v1.2' },
    {
      companyId: novaCompany._id,
      datasetId: novaDataset._id,
      version: 'v1.2',
      originalFileName: 'Nova_Retail_Sales_Demo.csv',
      storedFilePath: path.join(env.UPLOAD_DIR, 'demo_nova_sales.csv'),
      fileChecksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      fileSize: 3355443,
      fileType: 'CSV',
      rowCount: 12500,
      skuCount: 8,
      dateRange: '2024-01-01 to 2026-09-01',
      detectedFrequency: 'Daily',
      mappings: {
        Date: 'sale_date',
        SKU: 'product_code',
        Quantity: 'units_sold',
        ProductName: 'item_name',
        Category: 'category_desc',
        UnitPrice: 'unit_price_usd',
        LeadTime: 'supplier_lead_days',
        CurrentStock: 'on_hand_qty',
        UnitCost: 'cost_price_usd'
      },
      qualityScore: 94.2,
      qualityStatus: 'Passed Validation',
      qualityReport: {
        isValid: true,
        qualityScore: 94.2,
        detectedFrequency: 'Daily',
        totalRows: 12500,
        validRows: 12488,
        invalidRows: 12,
        skuCount: 8,
        dateRange: '2024-01-01 to 2026-09-01',
        passedChecks: [
          'Required Date column mapped to sale_date',
          'Required SKU column mapped to product_code',
          'Required Quantity column mapped to units_sold',
          'All date records conform to ISO standard',
          'Non-negative demand constraints validated'
        ],
        warningsCount: 12,
        errorsCount: 0,
        validationIssues: [
          {
            row: 42,
            field: "units_sold",
            value: "-5",
            issue: "Negative sale detected; treated as customer return and flagged.",
            severity: "Medium",
            status: "Flagged"
          },
          {
            row: 118,
            field: "sale_date",
            value: "2026-02-30",
            issue: "Invalid calendar date; skipped in aggregation.",
            severity: "High",
            status: "Filtered"
          }
        ]
      }
    },
    { upsert: true, new: true }
  );

  // Products for Nova Retail
  const novaCatalog = [
    {
      sku: 'SKU-101',
      name: 'Wireless Noise-Canceling Headphones',
      category: 'Electronics',
      unitPrice: 199.99,
      unitCost: 110.00,
      leadTimeDays: 14,
      currentStock: 120,
      onOrder: 50,
      backorders: 0,
      demandTrend: 'Steady Growth (+12%)',
      variability: 'Low-to-Medium',
      seasonality: 'Standard Weekly',
      averageDailyDemand: 18.5,
      supplier: 'Acoustic Labs Ltd',
      modelUsed: 'XGBoost Regressor'
    },
    {
      sku: 'SKU-102',
      name: 'Ergonomic Mechanical Keyboard',
      category: 'Electronics',
      unitPrice: 129.99,
      unitCost: 65.00,
      leadTimeDays: 10,
      currentStock: 340,
      onOrder: 0,
      backorders: 0,
      demandTrend: 'Stable Baseline',
      variability: 'Low',
      seasonality: 'Weekday Heavy',
      averageDailyDemand: 22.0,
      supplier: 'KeyTech Peripherals',
      modelUsed: 'ARIMA / SARIMA'
    },
    {
      sku: 'SKU-103',
      name: '4K Ultra-HD Monitor 27-inch',
      category: 'Electronics',
      unitPrice: 349.99,
      unitCost: 210.00,
      leadTimeDays: 21,
      currentStock: 440,
      onOrder: 0,
      backorders: 0,
      demandTrend: 'Seasonal Ramp-up',
      variability: 'High',
      seasonality: 'Weekend Spikes',
      averageDailyDemand: 14.0,
      supplier: 'VisionDisplay Corp',
      modelUsed: 'XGBoost Regressor'
    },
    {
      sku: 'SKU-104',
      name: 'Smart Fitness Tracker Watch',
      category: 'Electronics',
      unitPrice: 89.99,
      unitCost: 42.00,
      leadTimeDays: 7,
      currentStock: 25,
      onOrder: 10,
      backorders: 0,
      demandTrend: 'Rapid Upward Trend',
      variability: 'Moderate',
      seasonality: 'Holiday Spikes',
      averageDailyDemand: 28.0,
      supplier: 'PulseTech Wearables',
      modelUsed: 'XGBoost Regressor'
    },
    {
      sku: 'SKU-105',
      name: 'Organic Fair-Trade Coffee Beans 1kg',
      category: 'FMCG',
      unitPrice: 24.99,
      unitCost: 12.50,
      leadTimeDays: 5,
      currentStock: 85,
      onOrder: 20,
      backorders: 0,
      demandTrend: 'High Velocity Constant',
      variability: 'Low',
      seasonality: 'Consistent Daily',
      averageDailyDemand: 45.0,
      supplier: 'Andes Harvest Co',
      modelUsed: 'ARIMA / SARIMA'
    },
    {
      sku: 'SKU-106',
      name: 'Stainless Steel Insulated Tumbler',
      category: 'Home & Kitchen',
      unitPrice: 29.99,
      unitCost: 11.00,
      leadTimeDays: 14,
      currentStock: 850,
      onOrder: 200,
      backorders: 0,
      demandTrend: 'Slight Decline (-5%)',
      variability: 'Low',
      seasonality: 'Summer Peak',
      averageDailyDemand: 12.0,
      supplier: 'EcoVessel Goods',
      modelUsed: 'Naive Baseline'
    },
    {
      sku: 'SKU-107',
      name: 'Breathable Running Athletic Shoes',
      category: 'Apparel',
      unitPrice: 119.99,
      unitCost: 55.00,
      leadTimeDays: 18,
      currentStock: 160,
      onOrder: 50,
      backorders: 0,
      demandTrend: 'Seasonal Spring Spike',
      variability: 'High',
      seasonality: 'Spring/Summer',
      averageDailyDemand: 16.0,
      supplier: 'Velocity Athletics',
      modelUsed: 'XGBoost Regressor'
    },
    {
      sku: 'SKU-108',
      name: 'USB-C Fast Charging Multi-Port Hub',
      category: 'Electronics',
      unitPrice: 49.99,
      unitCost: 22.00,
      leadTimeDays: 8,
      currentStock: 190,
      onOrder: 0,
      backorders: 0,
      demandTrend: 'Consistent Baseline',
      variability: 'Low',
      seasonality: 'Regular Weekly',
      averageDailyDemand: 20.0,
      supplier: 'OmniConnect Ltd',
      modelUsed: 'ARIMA / SARIMA'
    }
  ];

  const today = new Date();
  for (const item of novaCatalog) {
    const demandValues = [];
    const demandHistory = [];
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - (89 - i));
      const qty = Math.max(1, Math.round(item.averageDailyDemand + Math.sin(i / 2) * 4));
      demandValues.push(qty);
      demandHistory.push({ date: d.toISOString().slice(0, 10), qty });
    }

    const inv = calculateInventoryMetrics({
      demandHistory: demandValues,
      leadTimeDays: item.leadTimeDays,
      currentStock: item.currentStock,
      onOrder: item.onOrder,
      backorders: item.backorders,
      unitCost: item.unitCost
    });

    const productDoc = await Product.findOneAndUpdate(
      { companyId: novaCompany._id, datasetId: novaDataset._id, sku: item.sku },
      {
        ...item,
        companyId: novaCompany._id,
        datasetId: novaDataset._id,
        datasetVersionId: novaDatasetVersion._id,
        safetyStock: inv.safetyStock,
        reorderPoint: inv.reorderPoint,
        targetInventory: inv.targetInventoryLevel,
        recommendedQty: inv.recommendedQty,
        riskLevel: inv.riskLevel,
        riskReason: inv.riskReason,
        forecastDemand30d: Math.round(item.averageDailyDemand * 30),
        datasetVersion: 'v1.2',
        demandHistory,
        isDemo: true
      },
      { upsert: true, new: true }
    );

    // If recommendation needed, create
    if (inv.recommendedQty > 0) {
      await Recommendation.findOneAndUpdate(
        { companyId: novaCompany._id, datasetId: novaDataset._id, sku: item.sku },
        {
          companyId: novaCompany._id,
          datasetId: novaDataset._id,
          datasetVersionId: novaDatasetVersion._id,
          sku: item.sku,
          productName: item.name,
          category: item.category,
          priority: inv.riskLevel === 'High Risk' ? 'High Priority' : 'Normal',
          status: 'Needs Review',
          recommendedQty: inv.recommendedQty,
          currentStock: item.currentStock,
          reorderPoint: inv.reorderPoint,
          safetyStock: inv.safetyStock,
          leadTimeDays: item.leadTimeDays,
          inventoryPosition: item.currentStock + item.onOrder,
          targetInventory: inv.targetInventoryLevel,
          unitCost: item.unitCost,
          estimatedOrderCost: item.unitCost ? inv.recommendedQty * item.unitCost : null,
          datasetVersion: 'v1.2'
        },
        { upsert: true }
      );
    } else {
      await Recommendation.deleteOne({ companyId: novaCompany._id, datasetId: novaDataset._id, sku: item.sku });
    }

    // Seed ForecastResult for flagship SKUs
    const seriesPoints = [];
    for (let d = 29; d >= 0; d--) {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - d);
      seriesPoints.push({
        date: dt.toISOString().slice(0, 10),
        demand: Math.max(1, Math.round(item.averageDailyDemand + Math.sin(d / 2) * 5)),
        forecast: null,
        confidenceUpper: null,
        confidenceLower: null,
        isForecast: false
      });
    }
    for (let f = 1; f <= 30; f++) {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + f);
      const fVal = Math.round(item.averageDailyDemand + (f * 0.05));
      seriesPoints.push({
        date: dt.toISOString().slice(0, 10),
        demand: null,
        forecast: fVal,
        confidenceUpper: fVal + 6,
        confidenceLower: Math.max(0, fVal - 6),
        isForecast: true
      });
    }

    await ForecastResult.findOneAndUpdate(
      { companyId: novaCompany._id, datasetId: novaDataset._id, sku: item.sku, horizon: 30 },
      {
        companyId: novaCompany._id,
        datasetId: novaDataset._id,
        forecastRunId: novaCompany._id,
        sku: item.sku,
        datasetVersion: 'v1.2',
        horizon: 30,
        frequency: 'Daily',
        selectedModel: item.modelUsed,
        selectionRationale: `Selected ${item.modelUsed} deterministically with validation sMAPE: 3.6%.`,
        metrics: {
          modelName: item.modelUsed,
          mae: 1.82,
          rmse: 2.45,
          smape: '3.6%',
          datasetVersion: 'v1.2',
          rationale: `Optimal error minimization on 30-day chronological test horizon.`
        },
        candidateModels: [
          {
            name: "Naive Baseline",
            category: "Baseline Statistical",
            status: "Evaluated",
            eligibility: "Eligible for all SKUs",
            isEligible: true,
            mae: 6.85,
            rmse: 8.90,
            smape: "12.4%",
            trainingTime: "0.05s",
            description: "Benchmark predicting last observed demand forward."
          },
          {
            name: "ARIMA / SARIMA",
            category: "Time Series Econometric",
            status: "Evaluated",
            eligibility: "Eligible: stationary trend",
            isEligible: true,
            mae: 2.95,
            rmse: 3.84,
            smape: "5.1%",
            trainingTime: "3.20s",
            description: "Econometric ARIMA model."
          },
          {
            name: "XGBoost Regressor",
            category: "Gradient Boosted Trees",
            status: "Evaluated (Selected)",
            eligibility: "Eligible: leakage-safe lag matrix",
            isEligible: true,
            mae: 1.82,
            rmse: 2.45,
            smape: "3.6%",
            trainingTime: "1.15s",
            description: "Gradient boosted decision trees."
          }
        ],
        series: seriesPoints,
        splitInfo: { totalPeriods: 60, trainPeriods: 42, valPeriods: 9, testPeriods: 9 }
      },
      { upsert: true }
    );
  }

  // Seed Model Comparison for Nova Retail (ONLY the 3 models: Naive, ARIMA/SARIMA, XGBoost)
  await ModelEvaluation.findOneAndUpdate(
    { companyId: novaCompany._id, datasetId: novaDataset._id, datasetVersion: 'v1.2' },
    {
      companyId: novaCompany._id,
      datasetId: novaDataset._id,
      datasetVersionId: novaDatasetVersion._id,
      datasetVersion: 'v1.2',
      models: [
        {
          id: "mod-001",
          name: "Naive Baseline",
          category: "Baseline Statistical",
          status: "Evaluated",
          eligibility: "Eligible for all SKUs",
          maeDemo: 6.85,
          rmseDemo: 8.90,
          smapeDemo: "12.4%",
          trainingTime: "0.05s",
          version: "v1.0",
          datasetVersion: "Nova Retail Demo v1.2",
          description: "Simplest benchmark model predicting next period demand equal to current period actual demand."
        },
        {
          id: "mod-002",
          name: "ARIMA / SARIMA",
          category: "Time Series Econometric",
          status: "Evaluated",
          eligibility: "Best for stationary/low-volatility demand",
          maeDemo: 2.95,
          rmseDemo: 3.84,
          smapeDemo: "5.1%",
          trainingTime: "3.20s",
          version: "v1.4",
          datasetVersion: "Nova Retail Demo v1.2",
          description: "Auto-Regressive Integrated Moving Average model for linear trend and seasonal patterns."
        },
        {
          id: "mod-003",
          name: "XGBoost Regressor",
          category: "Gradient Boosted Trees",
          status: "Evaluated (Primary Selected)",
          eligibility: "Best for multi-feature trend & promo data",
          maeDemo: 1.82,
          rmseDemo: 2.45,
          smapeDemo: "3.6%",
          trainingTime: "1.15s",
          version: "v2.1",
          datasetVersion: "Nova Retail Demo v1.2",
          description: "Gradient boosted decision tree model utilizing lagged demand features, day of week, and price elasticity."
        }
      ],
      chartData: [
        { name: "Naive Baseline", mae: 6.85, rmse: 8.90, trainingTime: 0.05 },
        { name: "ARIMA / SARIMA", mae: 2.95, rmse: 3.84, trainingTime: 3.20 },
        { name: "XGBoost Regressor", mae: 1.82, rmse: 2.45, trainingTime: 1.15 }
      ]
    },
    { upsert: true }
  );

  // Seed PDF Report for Nova Retail
  const novaReport = await Report.findOneAndUpdate(
    { companyId: novaCompany._id, title: 'Company Inventory & Stock Health Audit — Nova Retail' },
    {
      companyId: novaCompany._id,
      datasetId: novaDataset._id,
      datasetVersionId: novaDatasetVersion._id,
      title: 'Company Inventory & Stock Health Audit — Nova Retail',
      type: 'Company Inventory Report',
      description: 'Quarterly inventory posture report assessing safety stock thresholds and replenishment priorities.',
      datasetVersion: 'v1.2',
      skuScope: 'Electronics & FMCG SKUs',
      status: 'Ready',
      fileFormat: 'PDF',
      executiveSummary: 'Executive inventory audit assessing replenishment posture across catalog items. Identifies active stockout risks on fast-moving electronics and provides deterministic reorder recommendations.',
      generatedBy: 'Inventory Manager',
      reportData: {
        items: novaCatalog.map(c => ({
          sku: c.sku,
          name: c.name,
          currentStock: c.currentStock,
          forecastDemand30d: Math.round(c.averageDailyDemand * 30),
          reorderPoint: Math.round(c.averageDailyDemand * c.leadTimeDays + 30),
          recommendedQty: c.currentStock < 100 ? 150 : 0,
          riskLevel: c.currentStock < 100 ? 'High Risk' : 'Healthy'
        }))
      }
    },
    { upsert: true, new: true }
  );

  // Generate real PDF artifact on disk for Nova Retail
  const novaFolder = path.join(env.REPORT_DIR, novaCompany._id.toString());
  if (!fs.existsSync(novaFolder)) fs.mkdirSync(novaFolder, { recursive: true });
  const novaPdfPath = path.join(novaFolder, `report_${novaReport._id}.pdf`);
  await generateReportPDF(novaReport, novaCompany.name, novaPdfPath);
  novaReport.pdfPath = novaPdfPath;
  await novaReport.save();

  // Seed Activity Log for Nova Retail
  await ActivityLog.create({
    companyId: novaCompany._id,
    userId: novaManager._id,
    userEmail: novaManager.email,
    action: 'Demo System Initialized',
    category: 'Authentication',
    details: 'Seeded Nova Retail Demo environment with 8 catalog SKUs, XGBoost & ARIMA models, and inventory metrics.',
    status: 'Success'
  });

  // -------------------------------------------------------------
  // Company 2: Summit Supplies Demo (Strict Tenant Isolation)
  // -------------------------------------------------------------
  let summitCompany = await Company.findOne({ name: 'Summit Supplies Demo' });
  if (!summitCompany) {
    summitCompany = await Company.create({
      name: 'Summit Supplies Demo',
      industry: 'Industrial Supplies & B2B Hardware',
      tier: 'demo',
      isDemo: true
    });
  }

  const summitManager = await User.findOneAndUpdate(
    { email: 'manager@summitsupplies.demo' },
    {
      companyId: summitCompany._id,
      name: 'Summit Operations Lead',
      email: 'manager@summitsupplies.demo',
      passwordHash,
      role: 'inventory_manager',
      lastLogin: new Date()
    },
    { upsert: true, new: true }
  );

  await CompanySettings.findOneAndUpdate(
    { companyId: summitCompany._id },
    {
      companyId: summitCompany._id,
      defaultForecastHorizon: 14,
      serviceLevelZ: 1.96, // 97.5%
      reviewPeriodDays: 14,
      leadTimeDaysDefault: 21,
      defaultModelFamily: 'ARIMA / SARIMA'
    },
    { upsert: true }
  );

  // Summit Supplies isolated dataset & products
  const summitDataset = await Dataset.findOneAndUpdate(
    { companyId: summitCompany._id, name: 'Summit Industrial Hardware Sales' },
    {
      companyId: summitCompany._id,
      name: 'Summit Industrial Hardware Sales',
      description: 'Industrial fasteners and heavy equipment supplies historical sales.',
      source: 'Summit_Hardware_Sales.csv',
      currentVersion: 'v1.0',
      isDefault: true,
      isArchived: false
    },
    { upsert: true, new: true }
  );

  await DatasetVersion.findOneAndUpdate(
    { companyId: summitCompany._id, datasetId: summitDataset._id, version: 'v1.0' },
    {
      companyId: summitCompany._id,
      datasetId: summitDataset._id,
      version: 'v1.0',
      originalFileName: 'Summit_Hardware_Sales.csv',
      storedFilePath: path.join(env.UPLOAD_DIR, 'demo_summit_sales.csv'),
      fileChecksum: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      fileSize: 1845200,
      fileType: 'CSV',
      rowCount: 6400,
      skuCount: 3,
      dateRange: '2025-01-01 to 2026-08-01',
      detectedFrequency: 'Weekly',
      mappings: {
        Date: 'transaction_date',
        SKU: 'part_number',
        Quantity: 'units_distributed'
      },
      qualityScore: 96.0,
      qualityStatus: 'Passed Validation',
      qualityReport: {
        isValid: true,
        qualityScore: 96.0,
        detectedFrequency: 'Weekly',
        totalRows: 6400,
        validRows: 6400,
        invalidRows: 0,
        skuCount: 3,
        passedChecks: ['All columns mapped', 'Date ISO validated', 'Zero null rows']
      }
    },
    { upsert: true }
  );

  const summitCatalog = [
    {
      sku: 'SUM-201',
      name: 'High-Tensile Steel Hex Bolts (Pack of 500)',
      category: 'Fasteners',
      unitPrice: 75.00,
      unitCost: 35.00,
      leadTimeDays: 21,
      currentStock: 50,
      onOrder: 25,
      backorders: 0,
      averageDailyDemand: 8.0,
      supplier: 'Apex Steel Forging',
      modelUsed: 'ARIMA / SARIMA'
    },
    {
      sku: 'SUM-202',
      name: 'Hydraulic Seal Replacement Kit Pro',
      category: 'Pneumatics',
      unitPrice: 145.00,
      unitCost: 70.00,
      leadTimeDays: 14,
      currentStock: 15,
      onOrder: 0,
      backorders: 0,
      averageDailyDemand: 4.5,
      supplier: 'FluidDynamic Systems',
      modelUsed: 'XGBoost Regressor'
    },
    {
      sku: 'SUM-203',
      name: 'Heavy-Duty Industrial Bearings 6205-2RS',
      category: 'Machinery Components',
      unitPrice: 32.50,
      unitCost: 14.00,
      leadTimeDays: 28,
      currentStock: 220,
      onOrder: 50,
      backorders: 0,
      averageDailyDemand: 6.0,
      supplier: 'TorquePrecision Bearings',
      modelUsed: 'Naive Baseline'
    }
  ];

  const summitDatasetVersion = await DatasetVersion.findOne({ companyId: summitCompany._id, datasetId: summitDataset._id }).sort({ createdAt: -1 });
  const todaySummit = new Date();
  for (const item of summitCatalog) {
    const demandValues = [];
    const demandHistory = [];
    for (let i = 0; i < 90; i++) {
      const d = new Date(todaySummit);
      d.setDate(d.getDate() - (89 - i));
      const qty = Math.max(1, Math.round(item.averageDailyDemand + Math.cos(i / 2) * 2));
      demandValues.push(qty);
      demandHistory.push({ date: d.toISOString().slice(0, 10), qty });
    }
    const inv = calculateInventoryMetrics({
      demandHistory: demandValues,
      leadTimeDays: item.leadTimeDays,
      currentStock: item.currentStock,
      onOrder: item.onOrder,
      unitCost: item.unitCost
    });

    await Product.findOneAndUpdate(
      { companyId: summitCompany._id, datasetId: summitDataset._id, sku: item.sku },
      {
        ...item,
        companyId: summitCompany._id,
        datasetId: summitDataset._id,
        datasetVersionId: summitDatasetVersion?._id || null,
        safetyStock: inv.safetyStock,
        reorderPoint: inv.reorderPoint,
        targetInventory: inv.targetInventoryLevel,
        recommendedQty: inv.recommendedQty,
        riskLevel: inv.riskLevel,
        riskReason: inv.riskReason,
        forecastDemand30d: Math.round(item.averageDailyDemand * 30),
        datasetVersion: 'v1.0',
        demandHistory,
        isDemo: true
      },
      { upsert: true }
    );

    if (inv.recommendedQty > 0) {
      await Recommendation.findOneAndUpdate(
        { companyId: summitCompany._id, datasetId: summitDataset._id, sku: item.sku },
        {
          companyId: summitCompany._id,
          datasetId: summitDataset._id,
          datasetVersionId: summitDatasetVersion?._id || null,
          sku: item.sku,
          productName: item.name,
          category: item.category,
          priority: inv.riskLevel === 'High Risk' ? 'High Priority' : 'Normal',
          status: 'Needs Review',
          recommendedQty: inv.recommendedQty,
          currentStock: item.currentStock,
          reorderPoint: inv.reorderPoint,
          safetyStock: inv.safetyStock,
          leadTimeDays: item.leadTimeDays,
          inventoryPosition: item.currentStock + (item.onOrder || 0),
          targetInventory: inv.targetInventoryLevel,
          unitCost: item.unitCost,
          estimatedOrderCost: item.unitCost ? inv.recommendedQty * item.unitCost : null,
          datasetVersion: 'v1.0'
        },
        { upsert: true }
      );
    } else {
      await Recommendation.deleteOne({ companyId: summitCompany._id, datasetId: summitDataset._id, sku: item.sku });
    }
  }

  // Activity Log for Summit Supplies
  await ActivityLog.create({
    companyId: summitCompany._id,
    userId: summitManager._id,
    userEmail: summitManager.email,
    action: 'Summit Environment Seeded',
    category: 'Authentication',
    details: 'Seeded Summit Supplies Demo isolated environment with 3 B2B industrial hardware SKUs.',
    status: 'Success'
  });

  console.log('[CogniStock Seed] Seeding completed successfully!');
  console.log('--- DEMO CREDENTIALS ---');
  console.log('Company 1 (Nova Retail Demo):');
  console.log('  Admin:   admin@novaretail.demo / ' + demoPassword);
  console.log('  Manager: manager@novaretail.demo / ' + demoPassword);
  console.log('Company 2 (Summit Supplies Demo):');
  console.log('  Manager: manager@summitsupplies.demo / ' + demoPassword);
  console.log('------------------------');

  if (require.main === module) {
    await closeDB();
    process.exit(0);
  }
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('[CogniStock Seed] Error:', err);
    process.exit(1);
  });
}

module.exports = seed;
