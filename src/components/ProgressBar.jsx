import React from "react";

export default function ProgressBar({ value = 0 }) {
  // 1. Safety: Pastikan value tidak di bawah 0 atau di atas 1
  const safeValue = Math.min(Math.max(value, 0), 1);
  
  // 2. Hitung Persentase
  const pct = Math.round(safeValue * 100);

  return (
    <div className="progress-track" title={`${pct}% Probability`}>
      <div 
        className="progress-fill" 
        style={{ width: `${pct}%` }} 
      />
    </div>
  );
}