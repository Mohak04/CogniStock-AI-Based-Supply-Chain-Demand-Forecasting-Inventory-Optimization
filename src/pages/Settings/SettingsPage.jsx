import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import {
  Settings,
  User,
  Building,
  Sliders,
  ShieldCheck,
  Cpu,
  Boxes,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { authService } from '../../services/authService';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [saveToast, setSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Settings updated successfully.');

  const currentUser = authService.getCurrentUser() || {};

  // Form states
  const [companyName, setCompanyName] = useState(currentUser.companyName || '');
  const [industry, setIndustry] = useState('Multi-Category Retail & FMCG Distribution');
  const [defaultHorizon, setDefaultHorizon] = useState(30);
  const [primaryModel, setPrimaryModel] = useState('XGBoost Regressor');
  const [serviceLevelZ, setServiceLevelZ] = useState(1.65);
  const [leadTimeDays, setLeadTimeDays] = useState(14);
  const [reviewPeriodDays, setReviewPeriodDays] = useState(7);

  useEffect(() => {
    settingsService.getSettings().then((s) => {
      if (s) {
        if (s.defaultForecastHorizon) setDefaultHorizon(s.defaultForecastHorizon);
        if (s.serviceLevelZ) setServiceLevelZ(s.serviceLevelZ);
        if (s.reviewPeriodDays) setReviewPeriodDays(s.reviewPeriodDays);
        if (s.leadTimeDaysDefault) setLeadTimeDays(s.leadTimeDaysDefault);
        if (s.defaultModelFamily) setPrimaryModel(s.defaultModelFamily);
      }
    }).catch(() => {});

    settingsService.getCompany().then((c) => {
      if (c) {
        if (c.name) setCompanyName(c.name);
        if (c.industry) setIndustry(c.industry);
      }
    }).catch(() => {});
  }, []);

  const triggerToast = (msg = 'Settings updated successfully.') => {
    setToastMessage(msg);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      await settingsService.updateCompany({ name: companyName, industry });
      // Update local session
      const user = authService.getCurrentUser();
      if (user) {
        user.companyName = companyName;
        localStorage.setItem('cognistock_user', JSON.stringify(user));
      }
      triggerToast('Company profile saved.');
    } catch (err) {
      alert(`Error saving company: ${err.message}`);
    }
  };

  const handleSaveForecasting = async (e) => {
    e.preventDefault();
    try {
      await settingsService.updateSettings({
        defaultForecastHorizon: defaultHorizon,
        defaultModelFamily: primaryModel
      });
      triggerToast('Forecasting model parameters updated.');
    } catch (err) {
      alert(`Error updating settings: ${err.message}`);
    }
  };

  const handleSaveInventory = async (e) => {
    e.preventDefault();
    try {
      await settingsService.updateSettings({
        serviceLevelZ,
        leadTimeDaysDefault: leadTimeDays,
        reviewPeriodDays
      });
      triggerToast('Inventory optimization rules saved.');
    } catch (err) {
      alert(`Error updating inventory rules: ${err.message}`);
    }
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'company', label: 'Company Info', icon: Building },
    { id: 'forecasting', label: 'Forecasting Parameters', icon: Cpu },
    { id: 'inventory', label: 'Inventory Rules', icon: Boxes },
    { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
    { id: 'system', label: 'System Architecture', icon: Sliders }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="CogniStock System Settings"
        subtitle="Manage user profile details, default forecasting horizons, service level Z-scores, and company parameters."
        breadcrumbItems={[{ label: "System", href: "/settings" }, { label: "Settings" }]}
      />

      {saveToast && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toastMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs (Left 1 col) */}
        <div className="card-panel p-2 space-y-1 h-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content (Right 3 cols) */}
        <div className="md:col-span-3 card-panel p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">User Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={currentUser.name || ''}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={currentUser.email || ''}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Assigned Role</label>
                  <input
                    type="text"
                    value={currentUser.role === 'company_admin' ? 'Company Administrator' : 'Inventory Officer'}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Organization</label>
                  <input
                    type="text"
                    value={currentUser.companyName || ''}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">Company Information</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Industry Sector</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
                Save Company Info
              </button>
            </form>
          )}

          {activeTab === 'forecasting' && (
            <form onSubmit={handleSaveForecasting} className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">Forecasting Model Parameters</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Default Forecast Horizon</label>
                  <select
                    value={defaultHorizon}
                    onChange={(e) => setDefaultHorizon(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value={7}>7 Periods Horizon</option>
                    <option value={14}>14 Periods Horizon</option>
                    <option value={30}>30 Periods Horizon</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Primary Model Architecture Family</label>
                  <select
                    value={primaryModel}
                    onChange={(e) => setPrimaryModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="XGBoost Regressor">XGBoost Regressor (Gradient Boosted Trees)</option>
                    <option value="ARIMA / SARIMA">ARIMA / SARIMA (Econometric)</option>
                    <option value="Naive Baseline">Naive Baseline (Statistical Benchmark)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
                Update Model Configuration
              </button>
            </form>
          )}

          {activeTab === 'inventory' && (
            <form onSubmit={handleSaveInventory} className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">Inventory Optimization Rules</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Service Level Confidence (Z-Score)</label>
                  <select
                    value={serviceLevelZ}
                    onChange={(e) => setServiceLevelZ(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
                  >
                    <option value={1.65}>95% Service Level (Z = 1.65)</option>
                    <option value={1.96}>97.5% Service Level (Z = 1.96)</option>
                    <option value={2.33}>99% Service Level (Z = 2.33)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Default Supplier Lead Time (Days)</label>
                  <input
                    type="number"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
                    min={1}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Review Period (Days)</label>
                  <input
                    type="number"
                    value={reviewPeriodDays}
                    onChange={(e) => setReviewPeriodDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
                    min={1}
                  />
                </div>
              </div>
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
                Save Inventory Rules
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">Security & Tenancy</h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-slate-300">
                <div className="font-bold text-slate-100">Multi-Company Tenant Isolation</div>
                <p className="text-slate-400 leading-relaxed">
                  Every request is authenticated via signed JWT and authorized against your company partition ({currentUser.companyName}).
                  Cross-tenant access is strictly prohibited at the database and API layer.
                </p>
                <div className="pt-2 font-mono text-[11px] text-emerald-400">
                  Tenant Scoping: Active · Session: Authenticated Bearer
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">System Architecture & Pipeline</h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Frontend Stack:</span>
                  <span className="text-blue-400 font-bold">React 18 · Vite · Tailwind · Recharts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">REST API Backend:</span>
                  <span className="text-emerald-400 font-bold">Node.js Express (Port 5000) · MongoDB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ML Microservice:</span>
                  <span className="text-purple-400 font-bold">Python FastAPI (Port 8000)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Candidate Models:</span>
                  <span className="text-slate-200">Naive Baseline · ARIMA/SARIMA · XGBoost Regressor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reports Engine:</span>
                  <span className="text-amber-400 font-bold">PDFKit Server-Side Vector Generation</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
