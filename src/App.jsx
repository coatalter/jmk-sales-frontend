import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import SalesDashboard from "./components/SalesDashboard";
import SuperAdminPanel from "./components/SuperAdminPanel";
// 1. IMPORT COMPONENT BARU (Nanti kita buat)
import CustomerDetail from "./components/CustomerDetail"; 
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Route Sales */}
      <Route path="/sales" element={
        <ProtectedRoute role="sales">
          <SalesDashboard />
        </ProtectedRoute>
      } />

      {/* --- 2. TAMBAHKAN ROUTE DETAIL DISINI --- */}
      <Route path="/sales/customer/:id" element={
        <ProtectedRoute role="sales">
          <CustomerDetail />
        </ProtectedRoute>
      } />

      <Route path="/superadmin" element={
        <ProtectedRoute role="superadmin">
          <SuperAdminPanel />
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}