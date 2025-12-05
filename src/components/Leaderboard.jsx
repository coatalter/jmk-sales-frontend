import React, { useEffect, useState } from "react";
import { fetchLeaderboard } from "../services/leadsService";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchLeaderboard();
        setLeaders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    load();
    const interval = setInterval(load, 15000); // Refresh tiap 15 detik
    return () => clearInterval(interval);
  }, []);

  // Helper untuk mendapatkan style juara
  const getRankStyle = (index) => {
    if (index === 0) return { bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-700", text: "text-yellow-700 dark:text-yellow-400", icon: "👑" };
    if (index === 1) return { bg: "bg-slate-50 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-600", text: "text-slate-600 dark:text-slate-300", icon: "🥈" };
    if (index === 2) return { bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-700", text: "text-orange-700 dark:text-orange-400", icon: "🥉" };
    return { bg: "hover:bg-slate-50 dark:hover:bg-slate-800/50", border: "border-transparent", text: "text-muted", icon: `#${index + 1}` };
  };

  return (
    <div className="card h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 z-10 relative">
        <div>
          <h3 className="font-bold text-main text-lg">Top 10 Champions</h3>
          <p className="text-xs text-muted">Penjualan tertinggi bulan ini</p>
        </div>
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 z-10 relative">
        
        {loading && leaders.length === 0 && (
          <div className="text-center text-muted text-sm py-10 animate-pulse">Sedang memuat data juara...</div>
        )}

        {!loading && leaders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <span className="text-4xl mb-2">🏆</span>
            <p className="text-sm text-muted">Belum ada closing bulan ini.</p>
          </div>
        )}

        {leaders.slice(0, 10).map((leader, index) => {
          const style = getRankStyle(index);
          
          return (
            <div 
              key={index} 
              className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 ${style.bg} ${style.border}`}
            >
              {/* Rank Icon/Number */}
              <div className={`w-8 h-8 flex items-center justify-center font-bold text-lg ${style.text}`}>
                {style.icon}
              </div>

              {/* Avatar */}
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600`}>
                  {leader.avatar}
                </div>
                {/* Online Indicator (Hiasan) */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-main text-sm truncate">{leader.name}</div>
                <div className="text-xs text-muted flex items-center gap-1">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{leader.deals}</span> Closing
                </div>
              </div>

              {/* Score Badge */}
              <div className="text-right">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1 shadow-sm">
                  <div className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">{leader.score}</div>
                  <div className="text-[9px] text-muted uppercase font-bold tracking-wide">PTS</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Background decoration (optional) */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
