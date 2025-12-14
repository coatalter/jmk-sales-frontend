import React from "react";
import { Link } from "react-router-dom";
import { useCall } from "../context/CallContext"; 
import { openWhatsApp } from "../utils/whatsapp";

export default function CustomerTable({ customers = [], onContactSaved }) {
  const { startCall } = useCall(); 
  
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
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-muted italic">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
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
                      
                      {/* 1. TOMBOL WHATSAPP (ICON) */}
                      <button 
                        onClick={() => openWhatsApp(c.raw?.phone, c.name)} 
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-200"
                        title="Chat WhatsApp"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                      </button>

                      {/* 2. TOMBOL HUBUNGI (CALL COPILOT) */}
                      <button 
                        onClick={() => startCall(c)} 
                        className="btn btn-soft btn-small"
                      >
                        📞 Hubungi
                      </button>
                      
                      {/* 3. TOMBOL SALIN */}
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