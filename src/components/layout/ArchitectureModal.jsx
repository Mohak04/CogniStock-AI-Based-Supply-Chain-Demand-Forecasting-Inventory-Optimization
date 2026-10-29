import React from 'react';
import { Modal } from '../common/Modal';
import { Database, ShieldCheck, LineChart, Boxes, CheckSquare, ArrowRight, Cpu, Server, Code } from 'lucide-react';

export const ArchitectureModal = ({ isOpen, onClose }) => {
  const steps = [
    {
      num: "01",
      title: "Data Ingestion",
      icon: Database,
      desc: "Multi-format raw CSV/XLSX ingestion with schema detection, automated column mapping & field type validation.",
      tech: "React / Node.js Multer"
    },
    {
      num: "02",
      title: "Data Quality & Validation",
      icon: ShieldCheck,
      desc: "Missing value imputation, outlier detection, negative quantity checks, and time-series continuity verification.",
      tech: "Pandas / NumPy Pipeline"
    },
    {
      num: "03",
      title: "Demand Forecasting",
      icon: LineChart,
      desc: "Multi-model time-series forecasting engine with hyperparameter optimization and confidence margin estimation.",
      tech: "FastAPI / Naive / ARIMA-SARIMA / XGBoost"
    },
    {
      num: "04",
      title: "Inventory Intelligence",
      icon: Boxes,
      desc: "Deterministic replenishment math computing Lead Time Demand, Safety Stock, Reorder Point, and Target Stock Level.",
      tech: "Inventory Engine Microservice"
    },
    {
      num: "05",
      title: "Decision Support",
      icon: CheckSquare,
      desc: "Human-in-the-loop decision review portal for order draft approval, priority classification, and executive audit logging.",
      tech: "CogniStock Enterprise Dashboard"
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CogniStock — System Architecture & Roadmap" maxWidth="max-w-3xl">
      <div className="space-y-6 text-xs text-slate-300">
        {/* Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950 via-slate-900 to-purple-950 border border-blue-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-white">End-to-End Pipeline Architecture</h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900 text-blue-300 border border-blue-700">
              Review 1 Specification
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            CogniStock transforms unstructured historical sales records into explainable, automated inventory decision support using state-of-the-art demand forecasting algorithms.
          </p>
        </div>

        {/* 5-Step Pipeline Flow */}
        <div className="space-y-3">
          <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
            5-Stage Processing Pipeline
          </h5>
          <div className="grid grid-cols-1 gap-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-blue-400 font-mono font-bold text-xs shrink-0">
                    {step.num}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h6 className="font-bold text-slate-100 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-purple-400" /> {step.title}
                      </h6>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {step.tech}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tech Stack Specs */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800 font-mono text-[11px]">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase block font-semibold">Frontend Architecture</span>
            <p className="text-slate-200">React 18 · Vite · Tailwind CSS · Recharts · Lucide Icons</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase block font-semibold">Planned Backend Stack</span>
            <p className="text-slate-200">Node.js Express REST · MongoDB · Python FastAPI ML Service</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
