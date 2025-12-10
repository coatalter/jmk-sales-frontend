import React from "react";
import { Routes, Route } from "react-router-dom"; // Hapus Router di sini jika sudah ada di main.jsx
import Login from "./components/Login";
import SalesDashboard from "./components/SalesDashboard";
import CustomerDetail from "./components/CustomerDetail";
import SuperAdminPanel from "./components/SuperAdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import { CallProvider } from "./context/CallContext"; 

export default function App() {
  return (
    <CallProvider> 
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Sales Routes */}
        <Route path="/sales" element={
          <ProtectedRoute role="sales">
            <SalesDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/sales/customer/:id" element={
          <ProtectedRoute role="sales">
            <CustomerDetail />
          </ProtectedRoute>
        } />

        {/* Superadmin Routes */}
        <Route path="/superadmin" element={
          <ProtectedRoute role="superadmin">
            <SuperAdminPanel />
          </ProtectedRoute>
        } />

        {/* Redirect root to login for now */}
        <Route path="/" element={<Login />} />
      </Routes>
    </CallProvider> // <--- TUTUP DI SINI
  );
}