import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Database, User, ShieldCheck, ChevronDown, LogOut } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { authService } from '../../services/authService';

export const Header = ({ onOpenMobileMenu, onOpenArchitecture }) => {
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentUser = authService.getCurrentUser() || {
    name: 'Authorized User',
    email: 'user@workspace.com',
    companyName: 'CogniStock Enterprise',
    role: 'company_admin',
    isDemo: false
  };

  const getInitials = (name) => {
    if (!name) return 'CS';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(globalSearch)}`);
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await authService.logout();
  };

  return (
    <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & company status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Company / Dataset Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Workspace:</span>
          <span className="font-semibold text-slate-200">{currentUser.companyName || 'CogniStock Enterprise'}</span>
          {currentUser.isDemo && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-500/30">
              DEMO DATA
            </span>
          )}
        </div>
      </div>

      {/* Middle: Global Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search SKUs (e.g. SKU-104), catalog, reports..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </form>

      {/* Right: Notifications, Environment Badge, User Profile */}
      <div className="flex items-center gap-3">
        {/* Environment Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>{currentUser.isDemo ? 'Demo Environment' : 'Production Workspace'}</span>
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
              {getInitials(currentUser.name)}
            </div>
            <div className="hidden xl:flex flex-col">
              <span className="text-xs font-bold text-slate-200 leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentUser.role === 'company_admin' ? 'Company Admin' : 'Inventory Manager'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {userDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 text-xs animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="font-bold text-slate-200">{currentUser.name}</p>
                <p className="text-[11px] font-mono text-slate-400 truncate">{currentUser.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-500/30">
                    Role: {currentUser.role === 'company_admin' ? 'Admin' : 'Manager'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    {currentUser.companyName}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Account & Settings
                </button>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onOpenArchitecture();
                  }}
                  className="w-full text-left px-3 py-2 text-purple-400 hover:bg-slate-800 rounded-lg transition-colors font-semibold"
                >
                  System Architecture Specs
                </button>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-950/40 rounded-lg transition-colors inline-flex items-center gap-1.5 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
