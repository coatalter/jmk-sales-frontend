import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { updateLeadStatus } from "../services/leadsService";

export default function CustomerTable({ customers = [], onContactSaved }) {
  const [selected, setSelected] = useState(null);
  const [contactResult, setContactResult] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter === "" || statusFilter === "all") {
        return true;
      }
      
      return c.status === statusFilter;
    });
  }, [customers, statusFilter]);

  // ================================
  // OPEN MODAL (versi 2)
  // ================================
  const openContactModal = (c) => {
    setSelected(c);
    (c.status || "");
    setNotes(c.notes || "");
    setNotes(c.notes || "");
  };

  const closeModal = () => {
    setSelected(null);
    setContactResult("");
    setNotes("");
    setIsSaving(false);
  };

  // ================================
  // DO CONTACT (Versi 2)
  // ================================
  const doContact = async () => {
    if (!selected) return;
    setIsSaving(true);

    const payload = { 
      status: contactResult, 
      notes 
    };

    try {
      await updateLeadStatus(selected.id, payload);
      if (typeof onContactSaved === "function") {
        onContactSaved();
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan, cek console.");
      setIsSaving(false);
    }
  };


  // ================================
  // STATUS BADGE (versi 2)
  // ================================
  const renderStatusBadge = (c) => {
    const s = c.status;
    if (s === "success")
      return <span className="badge-success">Success</span>;
    if (s === "failed")
      return <span className="badge-failed">Failed</span>;
    if (s === "in_progress")
      return <span className="badge-progress">Follow Up</span>;
    return <span className="badge-new">New</span>;
  };

  return (
    <>
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

      {/* ================================
          TABLE
      ================================= */}
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
                    <Link to={`/sales/customer/${c.id}`} className="font-bold text-main hover:text-indigo-600 hover:underline transition-colors block">{c.name}</Link>
                    <span className="text-[10px] text-muted sm:hidden block mt-0.5">{c.job}</span>
                  </td>
                  <td>{c.age ?? "—"}</td>
                  <td>{c.job ?? "—"}</td>
                  <td className="font-bold text-main">{Math.round((c.score ?? 0) * 100)}%</td>
                  <td>
                    {c.lastContacted ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-main font-bold">{new Date(c.lastContacted).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}</span>
                        <span className="text-[10px] text-muted">{new Date(c.lastContacted).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ) : <span className="text-muted opacity-50">-</span>}
                  </td>
                  <td>{renderStatusBadge(c)}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openContactModal(c)} className="btn btn-ghost btn-small">Hubungi</button>
                      <button onClick={() => { navigator.clipboard?.writeText(c.raw?.phone || ""); alert("Nomor disalin"); }} className="btn btn-primary btn-small">Salin</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================================
          MODAL
      ================================= */}
      {selected && (
        <div className="modal-backdrop">
          <div className="modal-panel w-full max-w-lg mx-4">
            <div className="modal-header">
              <div>
                <h2 className="text-xl font-bold text-main">Catatan Panggilan</h2>
                <div className="text-sm text-muted mt-1">{selected.name} · {selected.job}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-xl font-bold text-muted hover:text-main">✕</button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-3">
                  Hasil Konfirmasi
                </label>

                <div className="grid grid-cols-3 gap-2">

                  {/* SUCCESS */}
                  <button
                    onClick={() => setContactResult("success")}
                    className={`contact-choice ${contactResult === "success" ? "yes" : "border"}`}
                  >
                    Berminat
                  </button>

                  {/* FAILED */}
                  <button
                    onClick={() => setContactResult("failed")}
                    className={`contact-choice ${contactResult === "failed" ? "no" : "border"}`}
                  >
                    Tidak Berminat
                  </button>

                  {/* IN PROGRESS */}
                  <button
                    onClick={() => setContactResult("in_progress")}
                    className={`contact-choice ${contactResult === "in_progress" ? "unk" : "border"}`}
                  >
                    Dalam Proses
                  </button>

                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Catatan Sales</label>
                <textarea className="input-field min-h-[120px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tulis hasil pembicaraan..." />
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-theme">
                <button onClick={() => setSelected(null)} className="btn btn-ghost" disabled={isSaving}>Batal</button>
                <button onClick={doContact} className="btn btn-primary" disabled={isSaving}>{isSaving ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
