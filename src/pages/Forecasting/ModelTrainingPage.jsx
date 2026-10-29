import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { ModelCard } from '../../components/forecasting/ModelCard';
import { LoadingState } from '../../components/common/LoadingState';
import { modelService } from '../../services/modelService';
import { Cpu, Play, CheckCircle2, Sliders, RefreshCw, Sparkles } from 'lucide-react';

export const ModelTrainingPage = () => {
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);
  const [trainLogs, setTrainLogs] = useState([]);

  useEffect(() => {
    modelService.getModels().then((data) => {
      setModels(data);
      setSelectedModel(data[2] || data[0]); // Default XGBoost
      setLoading(false);
    });
  }, []);

  const handleStartTraining = (modelToTrain) => {
    const target = modelToTrain || selectedModel;
    setIsTraining(true);
    setTrainProgress(0);
    setTrainLogs([`[00:00] Initiating feature engineering pipeline for ${target.name}...`]);

    const interval = setInterval(() => {
      setTrainProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          setTrainLogs((logs) => [
            ...logs,
            `[00:14] Hyperparameter tuning complete.`,
            `[00:14] Validation sMAPE: ${(Math.random() * 1.5 + 3.0).toFixed(1)}% achieved.`,
            `[00:14] New prototype model artifact saved to registry (v2.2-demo).`
          ]);
          return 100;
        }
        const next = p + 25;
        if (next === 25) setTrainLogs((logs) => [...logs, `[00:03] Extracting lag features & promotional encodings...`]);
        if (next === 50) setTrainLogs((logs) => [...logs, `[00:07] Cross-validating across 5 historical folds...`]);
        if (next === 75) setTrainLogs((logs) => [...logs, `[00:11] Computing Out-of-Fold sMAPE, MAE, and RMSE...`]);
        return next;
      });
    }, 400);
  };

  if (loading) return <LoadingState message="Loading ML model training environment..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ML Model Training Interface"
        subtitle="Configure, retrain, and tune machine learning forecasting models on ingested datasets."
        breadcrumbItems={[{ label: "Forecasting", href: "/forecasts" }, { label: "Model Training" }]}
      />

      {/* Dataset & Scope Bar */}
      <div className="card-panel p-4 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-slate-300">Target Training Dataset:</span>
          <span className="font-mono text-slate-200 bg-slate-950 px-3 py-1 rounded border border-slate-800">
            Nova Retail Historical Sales — Demo (v1.2)
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          45,230 Historical Records · 128 SKUs Scope
        </span>
      </div>

      {/* Grid of Model Cards */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          <span>Available Forecasting Model Architectures</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map((m) => (
            <ModelCard
              key={m.id}
              model={m}
              isSelected={selectedModel?.id === m.id}
              onSelect={() => setSelectedModel(m)}
              onTrainClick={(model) => {
                setSelectedModel(model);
                handleStartTraining(model);
              }}
            />
          ))}
        </div>
      </div>

      {/* Training Simulator Console */}
      <div className="card-panel p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-slate-100">
              Training Console — {selectedModel?.name || 'Selected Model'}
            </h4>
            <p className="text-xs text-slate-400">Simulating model iteration, cross-validation, and metrics logging.</p>
          </div>

          <button
            onClick={() => handleStartTraining()}
            disabled={isTraining}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/30"
          >
            {isTraining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {isTraining ? "Training Model..." : "Trigger Model Retraining"}
          </button>
        </div>

        {/* Progress bar */}
        {isTraining && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <span>Training Pipeline Progress</span>
              <span>{trainProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${trainProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Console Log Terminal */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1 min-h-[120px] text-slate-300">
          <div className="text-[10px] text-slate-500 border-b border-slate-900 pb-1 mb-2 uppercase tracking-wider">
            Prototype Execution Logs
          </div>
          {trainLogs.length === 0 ? (
            <span className="text-slate-600">Console ready. Click 'Trigger Model Retraining' to simulate execution logs.</span>
          ) : (
            trainLogs.map((log, idx) => (
              <div key={idx} className="text-emerald-400/90">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
