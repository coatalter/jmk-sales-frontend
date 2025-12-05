import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import ProgressBar from "./ProgressBar";
import { updateLeadStatus } from "../services/leadsService"; 

export default function CustomerTable({ customers = [], onContactSaved }) {
  const [selected, setSelected] = useState(null);
  const [subscribedChoice, setSubscribedChoice] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false); // State untuk loading tombol simpan

  const openContactModal = (c) => {
    setSelected(c);
    setSubscribedChoice(c.subscribed); 
    setNotes(c.notes || "");
  };

  const doContact = async () => {
    if (!selected) return;
    
    setIsSaving(true);
    try {
      // 1. MAPPING STATUS: Frontend (Boolean) -> Database (String)
      // Sesuaikan string ini dengan ENUM/Varchar di database kamu
      let statusDB = 'new'; 
      if (subscribedChoice === true) statusDB = 'closing';
      if (subscribedChoice === false) statusDB = 'failed';

      // 2. PANGGIL API UPDATE
      await updateLeadStatus(selected.id, { 
        status: statusDB, 
        notes: notes 
      });

      // 3. REFRESH DATA (Panggil fungsi dari Parent/SalesDashboard)
      if (onContactSaved) onContactSaved();
      
      setSelected(null);
      // alert(`Data ${selected.name} berhasil diupdate.`); // Optional feedback
    } catch (e) {
      console.error(e);
      alert("Gagal update ke Database: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="table-scroll">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Umur</th>
              <th>Pekerjaan</th>
              <th>Score</th>
              <th>Probabilitas</th>
              <th>Last Contact</th>
              <th>Status</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr><td colSpan={9} className="py-8 text-center text-muted italic">Tidak ada data ditemukan</td></tr>
            )}
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="text-xs text-muted">#{c.id}</td>
                
                {/* Link ke Detail */}
                <td>
                  <Link 
                    to={`/sales/customer/${c.id}`} 
                    className="font-bold text-main hover:text-indigo-600 hover:underline transition-colors"
                    title="Lihat Detail Profil"
                  >
                    {c.name}
                  </Link>
                </td>
                
                <td>{c.age ?? "-"}</td>
                <td>{c.job ?? "-"}</td>
                
                <td className="font-bold text-main">{Math.round((c.score ?? 0) * 100)}%</td>
                
                <td style={{ width: 180 }}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1"><ProgressBar value={c.score ?? 0} /></div>
                  </div>
                </td>
                
                <td>
                  {c.lastContacted ? (
                    <span className="text-xs text-muted font-medium">{new Date(c.lastContacted).toLocaleString("id-ID", { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  ) : <span className="text-muted opacity-50">-</span>}
                </td>
                
                <td>
                  {c.subscribed === true && <span className="badge-yes">Yes</span>}
                  {c.subscribed === false && <span className="badge-no">No</span>}
                  {(c.subscribed === null || c.subscribed === undefined) && <span className="badge-unk">Unknown</span>}
                </td>
                
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openContactModal(c)} className="btn btn-ghost btn-small">Hubungi</button>
                    <button onClick={() => { navigator.clipboard?.writeText(c.raw?.phone || ""); alert("Nomor disalin"); }} className="btn btn-primary btn-small">
                       Salin
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL --- */}
      {selected && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-header">
              <div>
                <h2 className="text-xl font-bold text-main">Catatan Panggilan</h2>
                <div className="text-sm text-muted mt-1">{selected.name} · {selected.job} · {selected.raw?.phone || "No Phone"}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-xl font-bold text-muted hover:text-main transition-colors">✕</button>
            </div>

            <div className="p-6"> 
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-3">Hasil Konfirmasi Langganan</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setSubscribedChoice(true)} className={`contact-choice ${subscribedChoice === true ? "contact-choice-yes" : "border"}`}>Ya, Berlangganan</button>
                    <button type="button" onClick={() => setSubscribedChoice(false)} className={`contact-choice ${subscribedChoice === false ? "contact-choice-no" : "border"}`}>Menolak</button>
                    <button type="button" onClick={() => setSubscribedChoice(null)} className={`contact-choice ${subscribedChoice === null ? "contact-choice-unk" : "border"}`}>Belum Jelas</button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Catatan Sales</label>
                  <textarea 
                      className="input-field min-h-[120px]" 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="Tulis hasil pembicaraan, alasan penolakan, atau jadwal follow-up..." 
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-theme">
                <button onClick={() => setSelected(null)} className="btn btn-ghost" disabled={isSaving}>Batal</button>
                <button onClick={doContact} className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Progress"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}