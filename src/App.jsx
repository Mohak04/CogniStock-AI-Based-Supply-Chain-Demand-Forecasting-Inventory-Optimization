import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

// Pages
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { DatasetsPage } from './pages/Datasets/DatasetsPage';
import { DatasetDetailPage } from './pages/Datasets/DatasetDetailPage';
import { UploadPage } from './pages/Datasets/UploadPage';
import { DataQualityPage } from './pages/Datasets/DataQualityPage';
import { ForecastsPage } from './pages/Forecasting/ForecastsPage';
import { ForecastDetailPage } from './pages/Forecasting/ForecastDetailPage';
import { ModelComparisonPage } from './pages/Forecasting/ModelComparisonPage';
import { InventoryPage } from './pages/Inventory/InventoryPage';
import { RecommendationsPage } from './pages/Inventory/RecommendationsPage';
import { ProductsPage } from './pages/Products/ProductsPage';
import { ProductDetailPage } from './pages/Products/ProductDetailPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { ReportDetailPage } from './pages/Reports/ReportDetailPage';
import { ActivityPage } from './pages/Activity/ActivityPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { authService } from './services/authService';

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export function App() {
  return (
    <Router>
      <Routes>
        {/* Auth & Landing */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Main Application Layout Wrapper */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Data */}
          <Route path="datasets" element={<DatasetsPage />} />
          <Route path="datasets/:id" element={<DatasetDetailPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="data-quality" element={<DataQualityPage />} />

          {/* Forecasting (Internalized training/registry removed from company UI) */}
          <Route path="forecasts" element={<ForecastsPage />} />
          <Route path="forecasts/:sku" element={<ForecastDetailPage />} />
          <Route path="models/comparison" element={<ModelComparisonPage />} />

          {/* Inventory */}
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />

          {/* Catalog & Analytics */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:sku" element={<ProductDetailPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/:id" element={<ReportDetailPage />} />

          {/* Governance & Settings */}
          <Route path="activity" element={<ActivityPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
