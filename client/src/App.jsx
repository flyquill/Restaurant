import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './components/auth/LoginPage';
import TakeawayPage from './components/takeaway/TakeawayPage';
import TablesPage from './components/tables/TablesPage';
import OrdersPage from './components/orders/OrdersPage';
import ItemsPage from './components/items/ItemsPage';
import StockPage from './components/StockPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Main Layout routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Direct root path to takeaway */}
            <Route index element={<Navigate to="/takeaway" replace />} />
            
            {/* Takeaway & Dine-in Tables */}
            <Route path="takeaway" element={<TakeawayPage />} />
            <Route path="tables" element={<TablesPage />} />
            
            {/* Orders History */}
            <Route path="orders" element={<OrdersPage />} />

            {/* Admin-only Routes */}
            <Route
              path="items"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ItemsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="stock"
              element={
                <ProtectedRoute adminOnly={true}>
                  <StockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute adminOnly={true}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
