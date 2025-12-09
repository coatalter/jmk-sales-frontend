import React, { useState, useMemo, useEffect, useCallback } from "react";
import Layout from "./Layout";
import KPI from "./KPI";
import CustomerTable from "./CustomerTable";
import Pagination from "./Pagination";
import SalesCharts from "./SalesCharts"; 
import Leaderboard from "./Leaderboard";       
import RecentActivity from "./RecentActivity"; 
import LoadingScreen from "./LoadingScreen";

// IMPORT SERVICE DATABASE
import { fetchLeads, fetchLeadsStats } from "../services/leadsService";

export default function SalesDashboard() {
  const [query, setQuery] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [jobFilter, setJobFilter] = useState("All");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [stats, setStats] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [5, 10, 25, 50, 100];

  // --- 1. LOAD DATA DARI DATABASE ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Data Leads & Stats secara paralel
      const [leadsData, statsData] = await Promise.all([
        fetchLeads({}), 
        fetchLeadsStats(),
      ]);

      // Safety Check: Pastikan data berupa array
      const safeLeads = Array.isArray(leadsData) ? leadsData : [];

      // MAPPING: Database Columns -> Frontend Props
      const mapped = safeLeads.map((row, index) => ({
        id: row.nasabah_id, 
        name: row.name || `Prospek #${index + 1}`,
        age: row.age,
        job: row.job,
        marital: row.marital,
        education: row.education,
        phone: row.phone,
        loanStatus: row.loan === 'yes' ? 'Punya pinjaman' : 'Tidak punya pinjaman',
        status: row.status,

        // SCORE
        score: Number(row.probability || 0), 
        probability: Number(row.probability || 0),
        
        // METADATA
        lastContacted: row.updated_at || null,
        notes: row.notes || "",
        
        raw: row, 
      }));

      setCustomers(mapped);
      setStats(statsData); 

    } catch (err) {
      console.error("Gagal load data dari API:", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load saat pertama kali render
  useEffect(() => {
    loadData();
  }, [loadData]);


  // --- 2. FILTERING & SORTING (Client Side) ---
  const jobs = useMemo(() => {
    const set = new Set(customers.map((c) => c.job).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [customers]);

  const filtered = useMemo(() => {
    return customers
      .filter((c) => c.score >= minScore)
      .filter((c) => (jobFilter === "All" ? true : c.job === jobFilter))
      .filter((c) =>
        (c.name + (c.job || "")).toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.score - a.score);
  }, [customers, query, minScore, jobFilter]);

  // Reset page saat filter berubah
  useEffect(() => {
    setPage(1);
  }, [query, minScore, jobFilter]);

  const total = filtered.length;
  
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // KPI Calculation
  const topLeads = customers.filter((c) => c.score >= 0.7).length;
  const convRate = customers.length > 0 ? `${Math.round((topLeads / customers.length) * 100)}%` : "0%";

  if (loading && customers.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      {/* 1. HEADER & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main">Dashboard Prospek</h1>
          <p className="text-muted text-sm mt-1">Kelola dan hubungi prospek prioritas tinggi.</p>
        </div>
        <div className="w-full sm:w-72">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Cari nama atau pekerjaan..."
            className="input-field"
          />
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <KPI title="Total Prospek" value={customers.length} />
        <KPI title="Prospek Hot (>=70%)" value={topLeads} />
        <KPI title="Potensi Konversi" value={convRate} />
      </div>

      {/* 3. CHARTS SECTION */}
      <SalesCharts data={filtered.length > 0 ? filtered : customers} />

      {/* 4. TABLE & FILTER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        
        {/* Kolom Kiri: Tabel */}
        <div className="lg:col-span-3 card h-fit">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-theme">
            <h3 className="font-bold text-main">Daftar Prospek</h3>
            <span className="text-xs text-muted font-medium bg-opacity-10 px-3 py-1 rounded-full border border-theme">
              Sorted by Probability
            </span>
          </div>

          <CustomerTable 
            customers={paginated} 
            onContactSaved={loadData} 
          />

          <Pagination
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            pageSizeOptions={pageSizeOptions}
          />
        </div>

        {/* Kolom Kanan: Filter */}
        <aside className="card h-fit lg:sticky lg:top-6">
          <h3 className="font-bold text-main mb-6">Filter Data</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wide">Min Probability</label>
                <span className="text-xs font-bold text-indigo-600">{Math.round(minScore * 100)}%</span>
              </div>
              <input
                type="range" min={0} max={1} step={0.01}
                value={minScore}
                onChange={(e) => setMinScore(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-2">Pekerjaan</label>
              <select
                className="input-field cursor-pointer font-medium"
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
              >
                {jobs.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
            
            <div className="pt-6 border-t border-theme">
                <button 
                  onClick={() => {setMinScore(0); setJobFilter("All"); setQuery("")}} 
                  className="w-full btn btn-ghost btn-small text-xs uppercase tracking-wider font-bold"
                >
                    Reset Filter
                </button>
            </div>
          </div>
        </aside>
      </div>

      {/* 5. BOTTOM SECTION: LEADERBOARD & ACTIVITY LOG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Leaderboard />
        <RecentActivity />
      </div>

    </Layout>
  );
}