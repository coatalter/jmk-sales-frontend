import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout, getCurrentUser } from "../services/authService";

export default function Layout({ children }) {
  const user = getCurrentUser();
  const nav = useNavigate();
  const location = useLocation();

  // 1. Logic Dark Mode
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // 2. Efek untuk pasang class "dark" di HTML
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const doLogout = () => {
    logout();
    nav("/login", { replace: true });
  };

  // --- PERBAIKAN LINK CLASS (NO HARDCODE) ---
  const linkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
      isActive
        ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20" // Active: Brand Color Solid
        : "text-muted hover:text-main hover:bg-slate-100 dark:hover:bg-slate-800 font-medium" // Inactive: Ikut Theme
    }`;
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300">
      <div className="flex">
        

        <aside className="layout-aside">

          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/30">
              J
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight leading-none text-main">JMK Sales</div>
              <div className="text-[10px] uppercase tracking-widest text-muted font-bold mt-1">Dashboard</div>
            </div>
          </div>


          <nav className="flex-1">
            <ul className="space-y-1 text-sm">
              <li>
                <Link to={user?.role === "superadmin" ? "/superadmin" : "/sales"} className={linkClass(user?.role === "superadmin" ? "/superadmin" : "/sales")}>
                  <span className={`text-xl transition-opacity ${location.pathname.includes('dashboard') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>📊</span> 
                  Dashboard
                </Link>
              </li>
              {user?.role === "superadmin" && (
                <li>
                  <Link to="/superadmin" className={linkClass("/superadmin")}>
                    <span className={`text-xl transition-opacity ${location.pathname === '/superadmin' ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>👥</span> 
                    Manage Sales
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Bagian Bawah: Toggle & Profile */}
          <div className="mt-auto pt-6 border-t border-dashed space-y-5" style={{ borderColor: 'var(--border-color)' }}>
            
            <button 
              onClick={() => setIsDark(!isDark)}
              className="w-full group flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer hover:shadow-sm"
              style={{ 
                backgroundColor: 'var(--bg-input)', 
                borderColor: 'var(--border-color)',
                color: 'var(--text-muted)'
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide group-hover:text-main transition-colors">
                <span>{isDark ? "🌙 Mode Gelap" : "☀️ Mode Terang"}</span>
              </div>
              
              {/* Switch UI */}
              <div className={`w-9 h-5 rounded-full p-1 transition-colors duration-300 ${isDark ? "bg-indigo-600" : "bg-slate-300"}`}>
                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDark ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </button>

            {/* Profile User */}
            <div className="flex items-center gap-3 px-1">
              <div className="user-avatar shadow-md">
                {(user?.name || "U").slice(0,2).toUpperCase()}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-sm font-bold truncate text-main">{user?.name}</div>
                <div className="text-xs text-muted capitalize font-medium">{user?.role}</div>
              </div>
              <button 
                onClick={doLogout} 
                className="p-2 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  );
}