import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function SalesCharts({ data = [] }) {

  // ============================
  //  LOGIKA STATUS (VERSI 2)
  // ============================
  const {
    newCount,
    inProgress,
    success,
    failed,
    openLeads,
    closedLeads,
  } = useMemo(() => {
    let newCount = 0;
    let inProgress = 0;
    let success = 0;
    let failed = 0;
    let openLeads = 0;
    let closedLeads = 0;

    data.forEach((c) => {
      const status = c.status;

      if (status === "new") newCount++;
      else if (status === "in_progress") inProgress++;
      else if (status === "success") success++;
      else if (status === "failed") failed++;

      if (status === "new" || status === "in_progress") openLeads++;
      if (status === "success" || status === "failed") closedLeads++;
    });

    return { newCount, inProgress, success, failed, openLeads, closedLeads };
  }, [data]);

  // ============================
  //    DATA CHART VERSI 1
  // ============================
  const statusBarData = [
    { name: "Baru", value: newCount },
    { name: "Follow Up", value: inProgress },
    { name: "Berhasil", value: success },
    { name: "Gagal", value: failed },
  ];

  const openVsClosedPieData = [
    { name: "Open Leads", value: openLeads, color: "#E58846" },
    { name: "Closed Leads", value: closedLeads, color: "#4f46e5" },
  ];

  const jobBarData = useMemo(() => {
    const jobCounts = {};
    data.forEach((c) => {
      const job = c.job || "Unknown";
      jobCounts[job] = (jobCounts[job] || 0) + 1;
    });

    return Object.entries(jobCounts)
      .map(([job, count]) => ({ job, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data]);

  // setelah hook → barulah kita boleh melakukan conditional return
  if (data.length === 0) return null;

  // ============================
  //  TOOLTIP SAMA VERSI 1
  // ============================
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="p-2 shadow-lg rounded border text-xs"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
          color: "var(--text-main)",
        }}
      >
        <p className="font-bold mb-1">{label || payload[0].name}</p>
        <p className="font-medium text-indigo-600">
          Total: {payload[0].value}
        </p>
      </div>
    );
  };

  // ============================
  //  UI VERSI 1
  // ============================
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
      <div className="card flex flex-col h-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">Status Konversi</h3>
        <div className="flex flex-col sm:flex-row gap-6 w-full h-[400px] sm:h-72">
          <div className="flex-1 w-full h-1/2 sm:h-full">
            {/* STATUS + PIE CONTACTED/UNKNOWN */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusBarData}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                <XAxis
                  type="number" hide
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PIE CONTACTED VS UNKNOWN */}
          <div className="w-full sm:w-48 h-1/2 sm:h-full flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-theme pt-4 sm:pt-0 sm:pl-4">
            <h4 className="text-[10px] uppercase font-bold text-muted mb-2 text-center">Rasio Kontak</h4>
            <div className="w-full h-full min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={openVsClosedPieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                  >
                    {openVsClosedPieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} stroke="none"/>
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: "10px",
                      color: "var(--text-muted)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* TOP JOBS */}
      <div className="card flex flex-col h-96 sm:h-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-6">Top 5 Pekerjaan</h3>
        <div className="w-full h-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={jobBarData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
              <XAxis
                type="number"
                hide
              />
              <YAxis
                type="category"
                dataKey="job"
                width={80}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
              <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
