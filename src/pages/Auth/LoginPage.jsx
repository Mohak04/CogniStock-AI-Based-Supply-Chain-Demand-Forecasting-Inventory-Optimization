import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Building } from 'lucide-react';
import { authService } from '../../services/authService';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('manager@novaretail.demo');
  const [password, setPassword] = useState('CogniStockDemo2026!');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('CogniStockDemo2026!');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Banner */}
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-100 tracking-tight">CogniStock</span>
            <span className="text-xs text-slate-400 font-mono block">AI Demand Intelligence</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Multi-Tenant Environment</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-10">
        {/* Left Branding Column */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-blue-400 font-mono">
            <span>CogniStock Enterprise Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-100 leading-tight">
            AI-Powered Demand Forecasting & Inventory Intelligence
          </h1>

          <p className="text-base text-slate-400 leading-relaxed max-w-lg">
            Transform raw historical sales data into deterministic demand signals, safety stock optimization, and human-guided replenishment recommendations.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 font-mono text-xs">
            <div>
              <span className="text-slate-500 block uppercase">Models</span>
              <span className="text-lg font-bold text-emerald-400">3 Families</span>
              <span className="text-[10px] text-slate-500 block">Naive, ARIMA, XGBoost</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase">Catalog Scope</span>
              <span className="text-lg font-bold text-blue-400">128 SKUs</span>
              <span className="text-[10px] text-slate-500 block">Demo Dataset</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase">Pipeline</span>
              <span className="text-lg font-bold text-purple-400">Validated</span>
              <span className="text-[10px] text-slate-500 block">Leakage-Safe</span>
            </div>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="card-panel p-8 space-y-6 max-w-md mx-auto w-full">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Sign in to CogniStock</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your credentials to access your company workspace.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <span
                  onClick={() => alert("To reset demo passwords, configure COGNISTOCK_DEMO_PASSWORD in .env or run npm run seed.")}
                  className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/30"
            >
              {loading ? "Authenticating Session..." : "Sign In to CogniStock"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-3 border-t border-slate-800 text-center space-y-2">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Quick Fill Demo Accounts:</span>
            <div className="flex items-center justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillDemo('manager@novaretail.demo')}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
              >
                Nova Retail
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('manager@summitsupplies.demo')}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
              >
                Summit Supplies
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Don't have a company account yet?{' '}
              <Link to="/register" className="text-blue-400 hover:underline font-semibold">
                Register New Company
              </Link>
            </p>
            <button
              onClick={() => navigate('/landing')}
              className="text-xs text-slate-400 hover:text-slate-200 underline font-medium block mx-auto"
            >
              View Product Welcome & Architecture Overview →
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto w-full text-center text-xs text-slate-500 font-mono border-t border-slate-900 pt-4">
        CogniStock Enterprise Demand Intelligence · Full-Stack Authenticated Environment
      </div>
    </div>
  );
};
