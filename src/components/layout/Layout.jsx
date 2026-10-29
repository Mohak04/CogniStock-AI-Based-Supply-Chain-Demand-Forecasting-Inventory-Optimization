import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PrototypeBanner } from './PrototypeBanner';
import { ArchitectureModal } from './ArchitectureModal';

export const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Global Prototype Banner */}
      {/* <PrototypeBanner /> */}

      <div className="flex flex-1 w-full relative">
        {/* Persistent Navigation Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenArchitecture={() => setIsArchModalOpen(true)}
        />

        {/* Main Application Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <Header
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenArchitecture={() => setIsArchModalOpen(true)}
          />

          {/* Page Workspace View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global System Architecture Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
};
