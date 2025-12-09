import React, { useEffect, useState } from "react";
import { fetchLogs } from "../services/leadsService"; 

export default function RecentActivity() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5; 

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

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const displayedLogs = logs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="card h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-main">🕒 Riwayat Aktivitas</h3>
        {/* HAPUS BG HARDCODE, GANTI BG-HOVER */}
        <span className="text-xs text-muted bg-hover px-2 py-1 rounded-md border border-theme">
          Total: {logs.length}
        </span>
      </div>
      
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
            <div className="absolute left-[14px] top-8 bottom-0 w-[2px] bg-hover group-last:hidden"></div>

            {/* Icon: Ganti logic bg dengan class semantic jika mungkin, atau gunakan opacity minimal */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 z-10 
              ${log.action.includes("Closing") 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
                : "bg-hover border-theme text-muted"
              }`}
            >
              {log.action.includes("Closing") ? "💰" : "📝"}
            </div>

            <div className="flex-1 pt-1">
              <p className="text-sm text-main leading-snug">
                <span className="font-bold text-indigo-600">{log.user}</span> 
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

      {totalPages > 1 && (
        <div className="mt-4 pt-4 border-t border-theme flex items-center justify-between">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost btn-small text-xs">← Previous</button>
          <span className="text-xs font-medium text-muted">Page <span className="text-main font-bold">{page}</span> of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-ghost btn-small text-xs">Next →</button>
        </div>
      )}
    </div>
  );
}