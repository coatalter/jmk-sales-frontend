import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCall } from "../context/CallContext"; 

export default function CustomerTable({ customers = [], onContactSaved }) {
  const { startCall } = useCall(); 
  const [statusFilter, setStatusFilter] = useState("");

  // --- FILTERING LOGIC ---
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter === "" || statusFilter === "all") {
        return true;
      }
      return c.status === statusFilter;
    });
  }, [customers, statusFilter]);

  // --- HELPER: STATUS BADGE ---
  const renderStatusBadge = (c) => {
    const s = c.status;
    if (s === "success") return <span className="badge-success">Success</span>;
    if (s === "failed") return <span className="badge-failed">Failed</span>;
    if (s === "in_progress") return <span className="badge-progress">Follow Up</span>;
    return <span className="badge-new">New</span>;
  };

  return (
    <>
      {/* --- HEADER FILTER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-1 gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-muted uppercase">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field py-1 px-3 w-full sm:w-auto text-sm cursor-pointer"
          >
            <option value="all">📂 Semua Data</option>
            <option value="new">🆕 Lead Baru</option>
            <option value="in_progress">⏳ Follow Up</option>
            <option value="success">✅ Berhasil</option>
            <option value="failed">⛔ Gagal</option>
          </select>
        </div>

        <span className="text-xs text-muted font-medium self-end sm:self-center">
          Total: <b className="text-main">{filteredCustomers.length}</b> Data
        </span>
      </div>

      {/* --- TABLE CONTENT --- */}
      <div className="table-scroll">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Umur</th>
              <th>Pekerjaan</th>
              <th>Score</th>
              <th>Terakhir Kontak</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-muted italic">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link 
                      to={`/sales/customer/${c.id}`} 
                      className="font-bold text-main hover:opacity-75 hover:underline transition-all block"
                    >
                      {c.name}
                    </Link>
                    <span className="text-[10px] text-muted sm:hidden block mt-0.5">{c.job}</span>
                  </td>
                  <td>{c.age ?? "—"}</td>
                  <td>{c.job ?? "—"}</td>
                  <td className="font-bold text-main">{Math.round((c.score ?? 0) * 100)}%</td>
                  <td>
                    {c.lastContacted ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-main font-bold">
                          {new Date(c.lastContacted).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-[10px] text-muted">
                          {new Date(c.lastContacted).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ) : <span className="text-muted opacity-50">-</span>}
                  </td>
                  <td>{renderStatusBadge(c)}</td>
                  <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => startCall(c)} 
                      className="btn btn-soft btn-small"
                    >
                      📞 Hubungi
                    </button>
                    
                    <button 
                      onClick={() => { navigator.clipboard?.writeText(c.raw?.phone || ""); alert("Nomor disalin"); }} 
                      className="btn btn-primary btn-small"
                    >
                      Salin
                    </button>
                  </div>
                </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}