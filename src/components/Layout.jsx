import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout, getCurrentUser } from "../services/authService";

export default function Layout({ children }) {
  const user = getCurrentUser();
  const nav = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State Mobile Menu

  // 1. Logic Dark Mode
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

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

  const linkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
      isActive
        ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20" 
        : "text-muted hover:text-main hover:bg-slate-100 dark:hover:bg-slate-800 font-medium" 
    }`;
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-body">
      
      {/* 1. MOBILE HEADER (Hanya muncul di HP) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-theme z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-muted hover:text-main">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <span className="font-bold text-lg text-main">JMK Sales</span>
        </div>
        <div className="user-avatar w-8 h-8 text-xs">{user?.name?.slice(0,2).toUpperCase()}</div>
      </div>

      {/* 2. OVERLAY (Untuk menutup sidebar di HP) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <div className="flex pt-16 md:pt-0 min-h-screen">
        
        {/* 3. SIDEBAR (Fixed di HP, Static di Desktop) */}
        <aside 
          className={`layout-aside fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:h-screen md:sticky md:top-0
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
        >
          <div className="flex items-center gap-3 px-2 mb-8 mt-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/30">J</div>
            <div>
              <div className="font-bold text-lg tracking-tight leading-none text-main">JMK Sales</div>
              <div className="text-[10px] uppercase tracking-widest text-muted font-bold mt-1">Dashboard</div>
            </div>
            {/* Close Button Mobile */}
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto text-muted p-1">✕</button>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1 text-sm">
              <li>
                <Link to={user?.role === "superadmin" ? "/superadmin" : "/sales"} className={linkClass(user?.role === "superadmin" ? "/superadmin" : "/sales")} onClick={() => setIsSidebarOpen(false)}>
                  <span className="text-xl opacity-70">📊</span> Dashboard
                </Link>
              </li>
              {user?.role === "superadmin" && (
                <li>
                  <Link to="/superadmin" className={linkClass("/superadmin")} onClick={() => setIsSidebarOpen(false)}>
                    <span className="text-xl opacity-70">👥</span> Manage Sales
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="mt-auto pt-6 border-t border-dashed border-theme space-y-5">
            <button onClick={() => setIsDark(!isDark)} className="w-full group flex items-center justify-between px-3 py-2.5 rounded-xl border border-theme bg-input hover:shadow-sm cursor-pointer">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted group-hover:text-main">
                <span>{isDark ? "🌙 Mode Gelap" : "☀️ Mode Terang"}</span>
              </div>
              <div className={`w-9 h-5 rounded-full p-1 transition-colors duration-300 ${isDark ? "bg-indigo-600" : "bg-slate-300"}`}>
                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDark ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </button>

            <div className="flex items-center gap-3 px-1">
              <div className="user-avatar shadow-md">{user?.name?.slice(0,2).toUpperCase()}</div>
              <div className="overflow-hidden flex-1">
                <div className="text-sm font-bold truncate text-main">{user?.name}</div>
                <div className="text-xs text-muted capitalize font-medium">{user?.role}</div>
              </div>
              <button onClick={doLogout} className="p-2 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer" title="Logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </div>
        </aside>

        {/* 4. MAIN CONTENT WRAPPER */}
        <main className="layout-main flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}