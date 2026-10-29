export const mockModels = [
  {
    id: "mod-001",
    name: "Naive Baseline",
    category: "Baseline Statistical",
    status: "Prototype Trained",
    eligibility: "Eligible for all SKUs",
    maeDemo: 6.85,
    rmseDemo: 8.90,
    smapeDemo: "12.4%",
    trainingTime: "0.2s",
    version: "v1.0",
    datasetVersion: "Nova Retail Demo v1.2",
    description: "Simplest benchmark model predicting next period demand equal to current period actual demand.",
    hyperparameters: {
      lookbackWindow: "7 Days",
      seasonalityAdjustment: "Disabled"
    }
  },
  {
    id: "mod-002",
    name: "ARIMA / SARIMA",
    category: "Time Series Econometric",
    status: "Prototype Trained",
    eligibility: "Best for stationary/low-volatility demand",
    maeDemo: 2.95,
    rmseDemo: 3.84,
    smapeDemo: "5.1%",
    trainingTime: "4.5s",
    version: "v1.4",
    datasetVersion: "Nova Retail Demo v1.2",
    description: "Auto-Regressive Integrated Moving Average model for linear trend and seasonal patterns.",
    hyperparameters: {
      order: "(1, 1, 1)",
      seasonalOrder: "(0, 1, 1, 7)",
      trend: "c"
    }
  },
  {
    id: "mod-003",
    name: "XGBoost Regressor",
    category: "Gradient Boosted Trees",
    status: "Prototype Trained (Primary)",
    eligibility: "Best for multi-feature trend & promo data",
    maeDemo: 1.82,
    rmseDemo: 2.45,
    smapeDemo: "3.6%",
    trainingTime: "12.8s",
    version: "v2.1",
    datasetVersion: "Nova Retail Demo v1.2",
    description: "Gradient boosted decision tree model utilizing lagged demand features, day of week, and price elasticity.",
    hyperparameters: {
      nEstimators: 300,
      learningRate: 0.05,
      maxDepth: 6,
      subsample: 0.8
    }
  }
];

export const mockModelRegistry = [
  {
    version: "v2.1-prod",
    modelName: "XGBoost Regressor",
    datasetVersion: "Nova Retail Demo v1.2",
    skuScope: "All Electronics & FMCG SKUs",
    trainedAt: "2026-09-28 04:00 PM",
    status: "Active Production Model",
    primaryMetric: "sMAPE 3.6%",
    artifactId: "xgboost_v2.1.pkl",
    artifactsSize: "14.2 MB",
    selectionRationale: "Lowest validation error on 30-day forecast horizon among evaluated models."
  },
  {
    version: "v1.4-prod",
    modelName: "ARIMA (1,1,1)",
    datasetVersion: "Nova Retail Demo v1.2",
    skuScope: "Office Supplies & Accessories",
    trainedAt: "2026-09-25 09:30 AM",
    status: "Active Model",
    primaryMetric: "sMAPE 5.1%",
    artifactId: "arima_v1.4.pkl",
    artifactsSize: "2.1 MB",
    selectionRationale: "Superior stability and computational speed for low-volatility catalog items."
  }
];
