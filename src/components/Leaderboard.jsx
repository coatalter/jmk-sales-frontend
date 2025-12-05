import React, { useEffect, useState } from "react";
import { fetchLeaderboard } from "../services/leadsService"; // Import API

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
    
    // Load pertama kali
    load();

    // Opsional: Refresh tiap 10 detik biar kerasa 'Live'
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-main">🏆 Top Sales Bulan Ini</h3>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded animate-pulse">
          Live
        </span>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        
        {loading && leaders.length === 0 && (
          <div className="text-center text-muted text-sm py-10">Memuat data...</div>
        )}

        {!loading && leaders.length === 0 && (
          <div className="text-center text-muted text-sm py-10">Belum ada data closing.</div>
        )}

        {leaders.map((leader, index) => (
          <div 
            key={index} 
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
          >
            {/* Rank Number */}
            <div className={`w-6 text-center font-bold ${
              index === 0 ? "text-yellow-500 text-lg" : 
              index === 1 ? "text-slate-400 text-lg" : 
              index === 2 ? "text-amber-700 text-lg" : "text-muted text-sm"
            }`}>
              {index + 1}
            </div>

            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
              index === 0 ? "bg-yellow-500" :
              index === 1 ? "bg-slate-400" :
              index === 2 ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-700"
            }`}>
              {leader.avatar}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="font-bold text-main text-sm">{leader.name}</div>
              <div className="text-xs text-muted font-medium">{leader.deals} Closing</div>
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="font-extrabold text-indigo-600 dark:text-indigo-400">{leader.score}</div>
              <div className="text-[10px] text-muted uppercase font-bold">Poin</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}