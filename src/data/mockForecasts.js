// Helper function to generate time-series actuals vs forecast with a clear cutoff date
export const generateTimeSeriesForSKU = (skuId) => {
  const dates = [];
  const baseDate = new Date("2026-08-01");
  const cutoffDayIndex = 30; // Day 30 is end of historical actuals

  // Specific demand profiles for demo SKUs
  let baseDemand = 20;
  let trendSlope = 0;
  let noiseLevel = 3;

  if (skuId === "SKU-101") { // Increasing
    baseDemand = 15;
    trendSlope = 0.4;
    noiseLevel = 2.5;
  } else if (skuId === "SKU-102") { // Stable
    baseDemand = 25;
    trendSlope = 0.02;
    noiseLevel = 2.0;
  } else if (skuId === "SKU-103") { // Seasonal
    baseDemand = 18;
    trendSlope = 0.1;
    noiseLevel = 4.0;
  } else if (skuId === "SKU-104") { // Declining
    baseDemand = 30;
    trendSlope = -0.35;
    noiseLevel = 3.0;
  } else if (skuId === "SKU-105") { // Volatile
    baseDemand = 28;
    trendSlope = 0.1;
    noiseLevel = 12.0;
  }

  for (let i = 0; i < 60; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isForecast = i >= cutoffDayIndex;

    let seasonalityFactor = 1.0;
    if (skuId === "SKU-103") {
      seasonalityFactor = 1.0 + 0.35 * Math.sin((i / 7) * Math.PI);
    }

    const calculatedValue = Math.max(1, Math.round((baseDemand + (i * trendSlope)) * seasonalityFactor));
    
    // Seeded pseudo-random noise for consistency
    const pseudoRandom = Math.sin(i * 999) * noiseLevel;

    if (!isForecast) {
      // Historical actual data
      const actualVal = Math.max(1, Math.round(calculatedValue + pseudoRandom));
      dates.push({
        date: dateStr,
        actual: actualVal,
        forecast: null,
        forecastUpper: null,
        forecastLower: null,
        isForecast: false,
        cutoffMarker: i === cutoffDayIndex - 1
      });
    } else {
      // Forecast data
      const forecastVal = Math.max(1, Math.round(calculatedValue));
      const confidenceMargin = Math.round(forecastVal * 0.15 + (i - cutoffDayIndex) * 0.4);
      
      dates.push({
        date: dateStr,
        actual: null,
        forecast: forecastVal,
        forecastUpper: forecastVal + confidenceMargin,
        forecastLower: Math.max(0, forecastVal - confidenceMargin),
        isForecast: true,
        cutoffMarker: false
      });
    }
  }

  return dates;
};

export const mockForecastMetrics = {
  "SKU-101": {
    horizon: "30 Days",
    modelName: "XGBoost Regressor (v2.1)",
    datasetVersion: "Nova Retail Demo v1.2",
    mae: 2.14,
    rmse: 2.85,
    smape: "4.2%",
    status: "Prototype Trained",
    rationale: "Selected based on superior fit for non-linear upward demand trends."
  },
  "SKU-102": {
    horizon: "30 Days",
    modelName: "ARIMA (1,1,1)",
    datasetVersion: "Nova Retail Demo v1.2",
    mae: 1.45,
    rmse: 1.92,
    smape: "3.1%",
    status: "Prototype Trained",
    rationale: "Selected for minimal variance on stationary, low-volatility historical demand."
  },
  "SKU-103": {
    horizon: "30 Days",
    modelName: "XGBoost Regressor (v2.1)",
    datasetVersion: "Nova Retail Demo v1.2",
    mae: 2.82,
    rmse: 3.91,
    smape: "5.2%",
    status: "Prototype Trained",
    rationale: "Best captures multi-frequency seasonal cycles and recurrent peak pattern spikes."
  },
  "SKU-104": {
    horizon: "30 Days",
    modelName: "XGBoost Regressor (v2.1)",
    datasetVersion: "Nova Retail Demo v1.2",
    mae: 2.90,
    rmse: 3.65,
    smape: "5.4%",
    status: "Prototype Trained",
    rationale: "Accurately weighs recent structural decline in sales velocity."
  },
  "SKU-105": {
    horizon: "30 Days",
    modelName: "ARIMA (1,1,1)",
    datasetVersion: "Nova Retail Demo v1.2",
    mae: 5.10,
    rmse: 7.40,
    smape: "9.2%",
    status: "Prototype Trained",
    rationale: "Selected for volatile time-series with high demand variance."
  }
};
