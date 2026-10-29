import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Upload, LayoutDashboard, Package, Cpu, FileText } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { label: 'Data Ingestion', path: '/', icon: Upload },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Product Analytics', path: '/products', icon: Package },
    { label: 'ML Training & Models', path: '/training', icon: Cpu },
    { label: 'PDF Reports', path: '/reports', icon: FileText }
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
          CS
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            CogniStock
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-normal">AI Support</span>
          </h1>
          <p className="text-[11px] text-slate-400">Demand Forecasting & Inventory Optimization</p>
        </div>
      </div>

      <nav className="flex items-center space-x-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center space-x-2">
        <span className="badge-actual">Phase 2 Ingestion</span>
      </div>
    </header>
  );
}
