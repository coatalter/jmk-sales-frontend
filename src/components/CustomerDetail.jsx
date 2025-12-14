import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import ProgressBar from "./ProgressBar";
import LoadingScreen from "./LoadingScreen";
import { fetchLeads, updateLeadStatus } from "../services/leadsService";
import { useCall } from "../context/CallContext";
import { openWhatsApp } from "../utils/whatsapp";
import { triggerConfetti } from "../utils/confetti";

export default function CustomerDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { startCall } = useCall();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State (Manual Override)
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Mengambil semua leads, logic ini bisa dioptimalkan 
        // dengan fetch single data by ID jika API mendukung
        const allLeads = await fetchLeads({});
        
        // Perbandingan loose equality (==) untuk menangani string vs number id
        const rawData = allLeads.find((l) => l.nasabah_id == id);

        if (!rawData) {
          alert("Data tidak ditemukan!");
          nav("/sales");
          return;
        }

        const mapped = {
          id: rawData.nasabah_id,
          name: rawData.name || `Prospek #${id}`,
          age: rawData.age,
          job: rawData.job,
          marital: rawData.marital,
          education: rawData.education,
          housing: rawData.housing,
          loan: rawData.loan,
          score: Number(rawData.probability),
          status: rawData.status ? rawData.status.toLowerCase() : "new",
          notes: rawData.notes || "",
          lastContacted: rawData.updated_at,
          raw: rawData,
        };

        setCustomer(mapped);
        setStatus(mapped.status);
        setNotes(mapped.notes);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    loadData();
  }, [id, nav]);

  const handleSave = async () => {
    if (!customer) return;
    setIsSaving(true);
    
    // Efek Confetti jika status berubah menjadi Deal (success)
    if (status === 'success') {
      triggerConfetti();
    }

    try {
      await updateLeadStatus(customer.id, { status, notes });
      alert("✅ Data berhasil disimpan!");
      setCustomer((prev) => ({
        ...prev,
        status,
        notes,
        lastContacted: new Date().toISOString(),
      }));

      nav("/sales")
    } catch (err) {
      alert("Gagal menyimpan.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- AI LOGIC (Analisa Nasabah) ---
  const aiAnalysis = useMemo(() => {
    if (!customer) return null;
    const { score, loan, housing, age } = customer;
    
    let title = "❄️ COLD LEAD";
    let colorClass = "text-slate-500";
    let reason = "Potensi konversi rendah berdasarkan profil risiko.";
    let strategy = "Tawarkan produk entry-level tanpa komitmen tinggi.";

    if (score >= 0.8) {
      title = "🔥 HOT PROSPECT";
      colorClass = "text-emerald-500";
      reason = "Profil sangat mirip (90%) dengan nasabah prioritas.";
      strategy = "Segera hubungi. Fokus pada urgensi penawaran.";
    } else if (score >= 0.5) {
      title = "⚖️ WARM LEAD";
      colorClass = "text-amber-500";
      reason = "Memiliki ketertarikan namun butuh edukasi produk.";
      strategy = "Kirim brosur via WhatsApp, lalu follow-up call.";
    }

    let productFocus = "Tabungan Reguler";
    if (loan === 'yes') productFocus = "Refinancing / Top Up";
    else if (housing === 'yes') productFocus = "Asuransi Properti";
    else if (age < 30) productFocus = "Kartu Kredit / KTA";

    return { title, reason, strategy, productFocus, colorClass };
  }, [customer]);

  if (loading) return <LoadingScreen />;
  if (!customer) return null;

  return (
    <Layout>
      {/* HEADER NAV */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => nav("/sales")}
          className="group flex items-center gap-2 text-sm font-bold text-muted hover:text-main transition-colors"
        >
          <span className="w-8 h-8 rounded-full bg-card border border-theme flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            ←
          </span>
          Kembali ke Dashboard
        </button>
        <div className="text-xs font-mono text-muted bg-hover px-3 py-1 rounded-full border border-theme">
          ID: #{customer.id}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === KOLOM KIRI (PROFILE & AI) === */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. PROFILE CARD */}
          <div className="card text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-hover opacity-50"></div>
            
            <div className="relative z-10 pt-8 pb-4">
              <div className="w-24 h-24 mx-auto mb-4 p-1 rounded-2xl bg-card border border-theme shadow-lg">
                 <div className="w-full h-full rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {customer.name.slice(0, 2).toUpperCase()}
                 </div>
              </div>
              
              <h1 className="text-xl font-bold text-main mb-1">{customer.name}</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hover border border-theme text-xs font-bold text-muted capitalize mt-1">
                💼 {customer.job || "Tidak diketahui"}
              </div>

              {/* ACTION BUTTONS (CALL & WA) */}
              <div className="mt-6 px-6 space-y-3">
                
                {/* Tombol Call Copilot */}
                <button 
                  onClick={() => startCall(customer)}
                  className="w-full btn btn-primary py-3 text-sm shadow-lg transform hover:-translate-y-1 transition-all"
                >
                  📞 Mulai Panggilan
                </button>

                {/* Tombol WhatsApp */}
                <button 
                  onClick={() => openWhatsApp(customer.raw?.phone, customer.name)}
                  className="w-full btn bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white transition-colors py-2.5 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <span className="text-lg">💬</span> Chat WhatsApp
                </button>

              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 text-center border-t border-theme pt-4 mx-4">
                <div>
                  <div className="text-[10px] text-muted uppercase font-bold tracking-wider">Umur</div>
                  <div className="text-sm text-main font-bold">{customer.age} Thn</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted uppercase font-bold tracking-wider">Status</div>
                  <div className="text-sm text-main font-bold capitalize">{customer.marital}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. AI INSIGHT CARD */}
          <div className="card border-l-4" style={{ borderLeftColor: 'var(--brand-primary)' }}>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              ✨ JMK AI Analysis
            </h3>
            
            <div className="text-center mb-6">
              <div className={`text-5xl font-extrabold mb-1 tracking-tighter ${aiAnalysis.colorClass}`}>
                {Math.round(customer.score * 100)}%
              </div>
              <p className={`text-xs font-bold uppercase tracking-widest ${aiAnalysis.colorClass}`}>
                {aiAnalysis.title}
              </p>
            </div>
            
            <ProgressBar value={customer.score} />
            
            <div className="mt-6 space-y-3">
              <div className="p-3 rounded-lg bg-hover border border-theme">
                <div className="text-[10px] uppercase font-bold text-muted mb-1">🔍 Kenapa skor ini?</div>
                <p className="text-xs text-main leading-relaxed font-medium">
                  {aiAnalysis.reason}
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-hover border border-theme">
                <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-1">💡 Strategi Sales</div>
                <p className="text-xs text-main leading-relaxed font-bold">
                  {aiAnalysis.strategy}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* === KOLOM KANAN (DATA & MANUAL EDIT) === */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. DATA GRID */}
          <div className="card">
            <h3 className="text-base font-bold text-main mb-6 flex items-center gap-2">
              📋 Informasi Lengkap
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Pendidikan Terakhir", val: customer.education, icon: "🎓" },
                { label: "Status Rumah", val: customer.housing === 'yes' ? 'Milik Sendiri' : 'Sewa', icon: "🏠" },
                { label: "Riwayat Pinjaman", val: customer.loan === 'yes' ? 'Ada Pinjaman' : 'Bebas Pinjaman', icon: "💳" },
                { label: "Kontak Terakhir", val: customer.lastContacted ? new Date(customer.lastContacted).toLocaleDateString() : "Belum pernah", icon: "🕒" }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-hover border border-theme flex items-center gap-4 hover:border-indigo-300 transition-colors">
                   <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-xl shadow-sm border border-theme">
                     {item.icon}
                   </div>
                   <div>
                     <label className="text-[10px] text-muted font-bold uppercase tracking-wide block">{item.label}</label>
                     <div className="text-main font-bold text-sm capitalize">{item.val}</div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. MANUAL UPDATE FORM */}
          <div className="card">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-theme">
              <h3 className="text-lg font-bold text-main">Catatan Manual</h3>
              <span className="text-[10px] text-muted bg-hover border border-theme px-2 py-1 rounded">
                Gunakan jika tidak melalui Call Copilot
              </span>
            </div>
            
            <div className="space-y-6">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-muted uppercase mb-3">Update Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {['success', 'failed', 'in_progress'].map((s) => {
                    const isActive = status === s;
                    const label = s === 'success' ? 'Deal' : s === 'failed' ? 'Gagal' : 'Follow Up';
                    const icon = s === 'success' ? '✅' : s === 'failed' ? '⛔' : '⏳';
                    
                    let btnClass = "contact-choice border"; 
                    if (isActive) {
                      if (s === 'success') btnClass = "contact-choice-success";
                      else if (s === 'failed') btnClass = "contact-choice-failed";
                      else if (s === 'in_progress') btnClass = "contact-choice-progress";
                    }

                    return (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={btnClass} 
                      >
                        <span className="text-lg mr-2">{icon}</span> {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notes Area */}
              <div>
                <label className="block text-xs font-bold text-muted uppercase mb-2">Catatan</label>
                <textarea 
                  className="input-field min-h-[120px] resize-none" 
                  placeholder="Tambahkan catatan manual..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="btn btn-primary px-6 w-full sm:w-auto"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}