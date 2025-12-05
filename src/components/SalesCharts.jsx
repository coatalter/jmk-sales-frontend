import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export default function SalesCharts({ data = [] }) {
  
  // 1. Logic Pie Chart
  const pieData = useMemo(() => {
    let yes = 0, no = 0, unknown = 0;
    data.forEach(c => {
      if (c.subscribed === true) yes++;
      else if (c.subscribed === false) no++;
      else unknown++;
    });
    return [
      { name: "Berlangganan", value: yes, color: "#10b981" }, // Emerald
      { name: "Menolak", value: no, color: "#ef4444" },      // Red
      { name: "Belum Jelas", value: unknown, color: "#f59e0b" } // Amber
    ];
  }, [data]);

  // 2. Logic Bar Chart
  const barData = useMemo(() => {
    const counts = {};
    data.forEach(c => {
      const job = c.job || "Unknown";
      counts[job] = (counts[job] || 0) + 1;
    });
    return Object.keys(counts)
      .map(key => ({ name: key, count: counts[key] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); 
  }, [data]);

  // --- CUSTOM TOOLTIP (THEME AWARE) ---
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        // Gunakan style manual agar ikut variable CSS index.css
        <div 
          className="p-3 shadow-xl rounded-lg border"
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)'
          }}
        >
          <p className="text-sm font-bold mb-1">{label || payload[0].name}</p>
          <p className="text-sm font-medium" style={{ color: '#4f46e5' }}>
            Total: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* --- CHART 1: PIE CHART --- */}
      <div className="card flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-6">Status Konversi</h3>
        
        {/* Container Fixed Height */}
        <div className="w-full h-72"> 
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                // Formatter agar teks legend ikut tema
                formatter={(value) => <span className="text-main text-sm font-medium ml-2">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- CHART 2: BAR CHART --- */}
      <div className="card flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-6">Top 5 Pekerjaan Prospek</h3>
        
        {/* Container Fixed Height */}
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                // Pakai CSS Variable untuk warna axis
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                width={80}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}