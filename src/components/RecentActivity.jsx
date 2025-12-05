import React, { useEffect, useState } from "react";
import { fetchLogs } from "../services/leadsService"; 

export default function RecentActivity() {
  const [logs, setLogs] = useState([]);

  // Load logs dari API
  const loadLogs = async () => {
    try {
      const data = await fetchLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLogs();
    
    // Polling setiap 5 detik untuk update realtime
    const interval = setInterval(() => {
      loadLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card h-full flex flex-col">
      <h3 className="font-bold text-main mb-6">🕒 Riwayat Aktivitas</h3>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
            <span className="text-2xl mb-2">💤</span>
            <p className="text-sm text-muted">Belum ada aktivitas.</p>
          </div>
        )}

        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-3 relative pb-5 last:pb-0 group">
            {/* Garis Vertikal */}
            {idx !== logs.length - 1 && (
              <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors"></div>
            )}

            {/* Icon Bulat */}
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex-shrink-0 flex items-center justify-center border border-indigo-100 dark:border-indigo-800 z-10 group-hover:scale-110 transition-transform">
              <span className="text-xs">⚡</span>
            </div>

            {/* Konten */}
            <div>
              <p className="text-sm text-main">
                <span className="font-bold">{log.user}</span> {log.action} <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.target}</span>
              </p>
              <p className="text-xs text-muted mt-1">
                {new Date(log.time).toLocaleDateString("id-ID")} • {new Date(log.time).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}