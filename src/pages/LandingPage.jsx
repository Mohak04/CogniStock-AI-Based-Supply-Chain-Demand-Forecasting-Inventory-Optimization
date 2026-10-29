import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Database,
  LineChart,
  Boxes,
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  Cpu,
  FileText,
  Workflow,
  Sparkles
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-100 tracking-tight">CogniStock</span>
              <span className="text-[10px] text-slate-400 font-mono block">AI Demand Intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/30 inline-flex items-center gap-1.5"
            >
              Explore Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-xs font-semibold font-mono">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Review 1 Frontend Prototype Specification
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
          AI-Powered Demand Forecasting & <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Inventory Intelligence
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Transform historical sales data into actionable demand insights and deterministic inventory decision support across your retail catalog.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm inline-flex items-center gap-2 shadow-xl shadow-blue-900/40 transition-all hover:scale-105"
          >
            Explore Interactive Dashboard <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold text-sm inline-flex items-center gap-2 transition-all hover:bg-slate-800"
          >
            <Database className="w-4 h-4 text-blue-400" /> Upload Demo Dataset
          </button>
        </div>
      </section>

      {/* Architecture Concept Flow */}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="card-panel p-8 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider font-bold">
              CogniStock Core Pipeline Architecture
            </span>
            <h2 className="text-2xl font-bold text-slate-100">End-to-End Decision Processing Flow</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
              <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto font-bold text-sm">
                01
              </div>
              <h3 className="font-bold text-slate-200 text-sm">Raw Sales Data</h3>
              <p className="text-xs text-slate-400">CSV/XLSX ingestion & schema mapping</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
              <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto font-bold text-sm">
                02
              </div>
              <h3 className="font-bold text-slate-200 text-sm">Demand Forecasting</h3>
              <p className="text-xs text-slate-400">ARIMA, SARIMA & XGBoost modeling</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
              <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto font-bold text-sm">
                03
              </div>
              <h3 className="font-bold text-slate-200 text-sm">Inventory Intelligence</h3>
              <p className="text-xs text-slate-400">Lead time, Safety Stock & ROP math</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto font-bold text-sm">
                04
              </div>
              <h3 className="font-bold text-slate-200 text-sm">Decision Support</h3>
              <p className="text-xs text-slate-400">Human-controlled order approval</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-panel p-6 space-y-3">
          <LineChart className="w-8 h-8 text-blue-400" />
          <h3 className="text-base font-bold text-slate-100">Demand Forecasting</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-model comparisons between Naive baseline, ARIMA/SARIMA, and XGBoost regressor across 7, 14, and 30-day horizons.
          </p>
        </div>

        <div className="card-panel p-6 space-y-3">
          <Boxes className="w-8 h-8 text-purple-400" />
          <h3 className="text-base font-bold text-slate-100">Inventory Intelligence</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automated stockout and overstock risk classification with transparent calculation formulas for every SKU.
          </p>
        </div>

        <div className="card-panel p-6 space-y-3">
          <FileText className="w-8 h-8 text-emerald-400" />
          <h3 className="text-base font-bold text-slate-100">Professional Reporting</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Executive PDF-ready report generation compiling SKU analysis, data quality audits, and stock posture.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 font-mono">
        CogniStock AI Demand Intelligence · Prototype Review 1 Environment
      </footer>
    </div>
  );
};
