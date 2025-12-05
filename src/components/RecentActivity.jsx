import React, { useEffect, useState } from "react";
import { fetchLogs } from "../services/leadsService"; 

export default function RecentActivity() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5; // Batasi 5 item per halaman

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
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  // Logic Pagination Client-Side
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const displayedLogs = logs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="card h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-main">🕒 Riwayat Aktivitas</h3>
        <span className="text-xs text-muted bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-theme">
          Total: {logs.length}
        </span>
      </div>
      
      {/* List Area */}
      <div className="flex-1 space-y-0 min-h-[300px]">
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50 h-full">
            <span className="text-3xl mb-2">💤</span>
            <p className="text-sm text-muted">Belum ada aktivitas.</p>
          </div>
        )}

        {displayedLogs.map((log, idx) => (
          <div key={idx} className="flex gap-4 relative pb-6 last:pb-0 group">
            {/* Timeline Line */}
            <div className="absolute left-[14px] top-8 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800 group-last:hidden"></div>

            {/* Icon */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 z-10 transition-colors
              ${log.action.includes("Closing") 
                ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800" 
                : "bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-700"
              }`}
            >
              {log.action.includes("Closing") ? "💰" : "📝"}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <p className="text-sm text-main leading-snug">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.user}</span> 
                {" "}{log.action.toLowerCase()}{" "} 
                <span className="font-semibold text-main decoration-dotted underline underline-offset-2">{log.target}</span>
              </p>
              <p className="text-[11px] text-muted mt-1 font-medium">
                {new Date(log.time).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })} • 
                {new Date(log.time).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 pt-4 border-t border-theme flex items-center justify-between">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs font-bold text-muted hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          
          <span className="text-xs font-medium text-muted">
            Page <span className="text-main font-bold">{page}</span> of {totalPages}
          </span>

          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-xs font-bold text-muted hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
