import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";


export default function ProtectedRoute({ children, role }) {
  const user = getCurrentUser();

  // 1. CEK LOGIN: Kalau tidak ada user di storage, tendang ke Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. CEK ROLE: Kalau user ada, tapi role-nya beda dengan yang diminta
  if (role && user.role !== role) {
    // JANGAN logout, tapi arahkan ke dashboard yang sesuai dengan role dia
    if (user.role === "superadmin") {
      return <Navigate to="/superadmin" replace />;
    } 
    if (user.role === "sales") {
      return <Navigate to="/sales" replace />;
    }
    
    // Fallback jika role tidak dikenal
    return <Navigate to="/login" replace />;
  }

  // 3. LOLOS: Tampilkan halaman
  return children;
}