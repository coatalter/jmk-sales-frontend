import React, { useEffect, useState, useMemo } from "react";
import LoadingScreen from "./LoadingScreen"; 
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import ProgressBar from "./ProgressBar";
import { fetchLeads, updateLeadStatus } from "../services/leadsService"; 

export default function CustomerDetail() {
  const { id } = useParams(); 
  const nav = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // FORM STATE
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const allLeads = await fetchLeads({});
        const rawData = allLeads.find(l => l.nasabah_id == id);

        if (!rawData) {
          alert("Data tidak ditemukan di database!");
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
          balance: 0,
          housing: rawData.housing,
          loan: rawData.loan,
          score: Number(rawData.probability),

          // STATUS BARU
          status: rawData.status,  // <= penting
          notes: rawData.notes || "",
          lastContacted: rawData.updated_at,

          raw: rawData
        };

        setCustomer(mapped);

        // Set form state awal
        setStatus(mapped.status);
        setNotes(mapped.notes);

      } catch (err) {
        console.error("Gagal load detail:", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    loadData();
  }, [id, nav]);


  const handleSave = async () => {
    if (!customer) return;

    setIsSaving(true);
    try {
      await updateLeadStatus(customer.id, {
        status,
        notes
      });

      alert("✅ Data berhasil disimpan!");
      nav("/sales");

      setCustomer(prev => ({
        ...prev,
        status,
        notes,
        lastContacted: new Date().toISOString()
      }));

      
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };


  // --- LOGIKA AI ANALYST ---
  const aiAnalysis = useMemo(() => {
    if (!customer) return null;
    const { score, loan, job, housing, age } = customer;
    let title = "";
    let reason = "";
    let strategy = "";
    let productFocus = "";
    let colorClass = ""; // Tetap pakai tailwind color util untuk text highlight

    if (score >= 0.8) {
      title = "🔥 HOT PROSPECT";
      colorClass = "text-emerald-600 dark:text-emerald-400";
      reason = "Data historis menunjukkan pola kemiripan 90% dengan nasabah loyal.";
      strategy = "Segera hubungi (Call/Visit). Fokus pada urgensi penawaran terbatas.";
    } else if (score >= 0.5) {
      title = "⚖️ WARM LEAD";
      colorClass = "text-amber-600 dark:text-amber-400";
      reason = "Nasabah memiliki potensi namun butuh edukasi produk lebih lanjut.";
      strategy = "Hubungi via WhatsApp dulu, kirim brosur digital, lalu follow-up call.";
    } else {
      title = "❄️ COLD LEAD";
      colorClass = "text-slate-500 dark:text-slate-400";
      reason = "Profil risiko agak tinggi atau ketertarikan rendah berdasarkan data.";
      strategy = "Jangan habiskan terlalu banyak waktu. Tawarkan produk entry-level saja.";
    }

    if (loan === 'yes') productFocus = "Refinancing / Take Over Kredit";
    else if (housing === 'yes' && job === 'management') productFocus = "Asuransi Properti / Investasi";
    else if (age < 30) productFocus = "Tabungan Pendidikan / Kartu Kredit";
    else productFocus = "Deposito Berjangka / Tabungan Reguler";

    return { title, reason, strategy, productFocus, colorClass };
  }, [customer]);


  if (loading) return <LoadingScreen />;
  if (!customer) return null;


  // BADGE STATUS DISPLAY (UI tidak diubah)
  // const renderStatusBadge = () => {
  //   if (customer.status === "success")
  //     return <span className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm border border-emerald-200">✅ Deal Berhasil</span>;

  //   if (customer.status === "failed")
  //     return <span className="px-4 py-2 rounded-full bg-rose-100 text-rose-700 font-bold text-sm border border-rose-200">❌ Gagal / Tidak Berminat</span>;

  //   if (customer.status === "in_progress")
  //     return <span className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 font-bold text-sm border border-amber-200">📞 Follow Up</span>;

  //   return <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm border border-blue-200">🕒 Baru Masuk</span>;
  // };


  return (
    <Layout>
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={() => nav("/sales")} 
          className="group flex items-center gap-2 text-sm font-bold text-muted hover:text-indigo-600 transition-colors"
        >
          <span className="w-8 h-8 rounded-full bg-card border border-theme flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">←</span> Kembali ke Dashboard
        </button>
        <div className="text-xs font-mono text-muted">ID: #{customer.id}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- KOLOM KIRI (4 Column) --- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. KARTU PROFIL */}
          {/* Menggunakan class 'card' sepenuhnya */}
          <div className="card text-center relative overflow-hidden">
            {/* Hiasan background gradient tetap ok pakai utility karena dia dekorasi */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10"></div>
            
            <div className="relative z-10 pt-6 pb-6">
              {/* Avatar Container: Menggunakan bg-card agar ikut tema */}
              <div className="w-24 h-24 rounded-full bg-card mx-auto flex items-center justify-center p-1 shadow-lg mb-4 ring-4 ring-indigo-50 dark:ring-indigo-900/20">
                 <div className="w-full h-full rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                    {customer.name.slice(0, 2).toUpperCase()}
                 </div>
              </div>
              
              {/* Text menggunakan var(--text-main) via class .text-main */}
              <h1 className="text-xl font-bold text-main mb-1">{customer.name}</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hover text-xs font-bold text-muted capitalize border border-theme">
                💼 {customer.job || "Tidak diketahui"}
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-2 text-center border-t border-theme pt-4 mx-4">
                 <div>
                    <div className="text-[10px] text-muted uppercase font-bold">Umur</div>
                    <div className="text-sm text-main font-bold">{customer.age} Thn</div>
                 </div>
                 <div>
                    <div className="text-[10px] text-muted uppercase font-bold">Status</div>
                    <div className="text-sm text-main font-bold capitalize">{customer.marital}</div>
                 </div>
              </div>
            </div>
          </div>

          {/* 2. KARTU AI INSIGHT */}
          <div className="card">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              🤖 JMK AI Insight
            </h3>
            
            <div className="text-center">
              <div className={`text-4xl font-extrabold mb-2 ${aiAnalysis.colorClass}`}>
                {Math.round(customer.score * 100)}%
              </div>
              <p className={`text-sm font-bold mb-4 ${aiAnalysis.colorClass}`}>{aiAnalysis.title}</p>
              
              <ProgressBar value={customer.score} />
              
              <div className="mt-6 space-y-3 text-left">
                {/* Gunakan bg-hover untuk box background */}
                <div className="p-3 rounded-lg bg-hover border border-theme">
                  <div className="text-[10px] uppercase font-bold text-muted mb-1">Analisa</div>
                  <p className="text-xs text-main leading-relaxed">
                    {aiAnalysis.reason}
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                   <div className="text-[10px] uppercase font-bold text-indigo-500 mb-1">Strategi</div>
                   <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed font-bold">
                    {aiAnalysis.strategy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* --- KOLOM KANAN (8 Column) --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. DATA LENGKAP */}
          <div className="card">
            <h3 className="text-base font-bold text-main mb-6 flex items-center gap-2 border-l-4 border-indigo-500 pl-3">
              Data Lengkap
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Pendidikan", val: customer.education, icon: "🎓" },
                { label: "Rumah", val: customer.housing === 'yes' ? 'Milik Sendiri' : 'Sewa', icon: "🏠" },
                { label: "Pinjaman", val: customer.loan === 'yes' ? 'Ada' : 'Tidak Ada', icon: "💳" },
                { label: "Kontak Terakhir", val: customer.lastContacted ? new Date(customer.lastContacted).toLocaleDateString() : "Belum", icon: "🕒" }
              ].map((item, idx) => (
                // Gunakan bg-hover agar konsisten
                <div key={idx} className="p-4 rounded-xl bg-hover border border-theme">
                   <label className="text-[10px] text-muted font-bold uppercase mb-1 block">{item.label}</label>
                   <div className="text-main font-bold text-sm flex items-center gap-2">
                      <span>{item.icon}</span> <span className="capitalize">{item.val}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. FORM UPDATE */}
          <div className="card border-t-4 border-t-indigo-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-main">Update Status & Catatan</h3>
              {isSaving && <span className="text-xs text-indigo-600 animate-pulse font-bold">Menyimpan...</span>}
            </div>
            
            <div className="space-y-6">
              {/* Status Buttons - MENGGUNAKAN CLASS DARI INDEX.CSS */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase mb-3">
                    Tentukan Status Akhir
                  </label>

                  <div className="grid grid-cols-3 gap-3">

                    <button 
                      onClick={() => setStatus("success")} 
                      className={`contact-choice ${status === "success" ? "contact-choice-yes" : "border"}`}
                    >
                      <span className="text-lg block mb-1">🤝</span> Deal Berhasil
                    </button>

                    <button 
                      onClick={() => setStatus("failed")} 
                      className={`contact-choice ${status === "failed" ? "contact-choice-no" : "border"}`}
                    >
                      <span className="text-lg block mb-1">⛔</span> Gagal
                    </button>

                    <button 
                      onClick={() => setStatus("in_progress")} 
                      className={`contact-choice ${status === "in_progress" ? "contact-choice-unk" : "border"}`}
                    >
                      <span className="text-lg block mb-1">⏳</span> Follow Up
                    </button>

                  </div>
                </div>
              </div>

              {/* Text Area - MENGGUNAKAN CLASS INPUT-FIELD */}
              <div>
                <label className="block text-xs font-bold text-muted uppercase mb-2">Catatan Percakapan</label>
                <div className="relative">
                  {/* Class 'input-field' otomatis handle warna bg dan text di dark/light mode */}
                  <textarea 
                    className="input-field min-h-[120px] resize-none" 
                    placeholder="Tulis ringkasan pembicaraan..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] text-muted opacity-70">
                    {notes.length} char
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="btn btn-primary px-8 py-3 w-full sm:w-auto font-bold shadow-lg"
                >
                  {isSaving ? "⏳ Menyimpan..." : "💾 Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>

        </div>
    </Layout>
  );
}
