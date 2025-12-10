import React from "react";

export default function KPI({ title, value, delta, icon }) {
  const isNegative = delta?.toString().includes("-");
  
  const deltaColor = isNegative ? "text-rose-500" : "text-emerald-500";
  const arrow = isNegative ? "▼" : "▲";

  return (
    <div className="kpi group">
      <div className="flex justify-between items-start">
        <div className="kpi-title group-hover:text-indigo-500 transition-colors">
          {title}
        </div>
        {icon && (
          <div className="p-2 bg-indigo-50 dark:bg-slate-700 rounded-lg text-indigo-600 dark:text-indigo-400 text-xl">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 mt-2">
        <div className="kpi-value">
          {value}
        </div>
        
        {delta && (
          <div className={`text-xs font-bold ${deltaColor} mb-1 flex items-center bg-opacity-10 px-1.5 py-0.5 rounded`}>
            <span className="mr-1 text-[10px]">{arrow}</span> {delta.replace("-", "")}
          </div>
        )}
      </div>
    </div>
  );
}