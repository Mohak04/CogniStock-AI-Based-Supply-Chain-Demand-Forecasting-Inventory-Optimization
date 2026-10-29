import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  UploadCloud,
  FileCheck,
  LineChart,
  Cpu,
  Layers,
  BarChart3,
  Boxes,
  CheckSquare,
  PackageSearch,
  FileText,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Workflow
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile, onOpenArchitecture }) => {
  const location = useLocation();

  const navGroups = [
    {
      groupTitle: "Overview",
      items: [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
      ]
    },
    {
      groupTitle: "Data Engine",
      items: [
        { path: "/datasets", label: "Datasets", icon: Database },
        { path: "/upload", label: "Upload Data", icon: UploadCloud },
        { path: "/data-quality", label: "Data Quality", icon: FileCheck }
      ]
    },
    {
      groupTitle: "Forecasting",
      items: [
        { path: "/forecasts", label: "Demand Forecasts", icon: LineChart },
        { path: "/models/comparison", label: "Model Comparison", icon: BarChart3 }
      ]
    },
    {
      groupTitle: "Inventory Intelligence",
      items: [
        { path: "/inventory", label: "Inventory Intelligence", icon: Boxes },
        { path: "/recommendations", label: "Recommendations", icon: CheckSquare }
      ]
    },
    {
      groupTitle: "Analytics & Catalog",
      items: [
        { path: "/products", label: "Products Catalog", icon: PackageSearch },
        { path: "/reports", label: "Reports Center", icon: FileText }
      ]
    },
    {
      groupTitle: "System & Governance",
      items: [
        { path: "/activity", label: "Activity / Audit", icon: Activity },
        { path: "/settings", label: "Settings", icon: Settings }
      ]
    }
  ];

  const content = (
    <div className="h-full flex flex-col justify-between bg-slate-900 border-r border-slate-800/80 text-slate-300 select-none">
      {/* Top Branding Section */}
      <div>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/30 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-base text-slate-100 tracking-tight leading-none">CogniStock</span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 truncate">AI Demand Intelligence</span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation links */}
        <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-500">
                  {group.groupTitle}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive: active }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        active || isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <button
          onClick={onOpenArchitecture}
          className={`w-full p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-xs font-semibold flex items-center gap-2 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Pipeline Architecture Specs"
        >
          <Workflow className="w-4 h-4 text-purple-400 shrink-0" />
          {!isCollapsed && <span>About CogniStock</span>}
        </button>

        {!isCollapsed && (
          <div className="px-2 py-1 text-[10px] font-mono text-slate-500 text-center border-t border-slate-800/50 pt-2">
            CogniStock Enterprise · v1.0
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block h-screen sticky top-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-64 h-full z-10">{content}</div>
        </div>
      )}
    </>
  );
};
