import React, { useState, useEffect, useMemo } from "react";
import { updateLeadStatus } from "../services/leadsService";
import { triggerConfetti } from "../utils/confetti"; 

// --- DEFINISI SKRIP BERCABANG ---
const SCRIPT_FLOW = {
  START: {
    id: "START",
    text: "Halo, selamat pagi/siang. Bisa bicara dengan Bapak/Ibu [Name]? Saya [SalesName] dari JMK Bank.",
    options: [
      { label: "✅ Ya, Bisa", next: "OPENING_PITCH" },
      { label: "⛔ Sibuk / Matikan", next: "BUSY" },
      { label: "🤔 Siapa ini?", next: "INTRO_REPEAT" },
    ],
  },
  INTRO_REPEAT: {
    id: "INTRO_REPEAT",
    text: "Saya [SalesName], Relationship Manager dari JMK Bank. Saya menghubungi terkait status prioritas akun Bapak/Ibu.",
    options: [
      { label: "Lanjut", next: "OPENING_PITCH" },
      { label: "Matikan", next: "BUSY" },
    ],
  },
  BUSY: {
    id: "BUSY",
    text: "(Jangan memaksa). Baik Pak/Bu, mohon maaf mengganggu waktunya. Kira-kira kapan waktu yang lebih longgar untuk saya hubungi kembali?",
    options: [
      { label: "📞 Dapat Jadwal", next: "RESCHEDULE" },
      { label: "⛔ Menolak Total", next: "END_REJECT" },
    ],
  },
  OPENING_PITCH: {
    id: "OPENING_PITCH",
    text: "Terima kasih waktunya. Saat ini kami sedang ada program khusus 'JMK Priority' dengan bunga flat 0.8% untuk nasabah terpilih seperti Anda. Apakah Bapak/Ibu ada rencana renovasi atau kebutuhan dana tunai dalam waktu dekat?",
    options: [
      { label: "😍 Tertarik", next: "EXPLAIN_PRODUCT" },
      { label: "💸 Mahal Bunganya", next: "HANDLE_EXPENSIVE" },
      { label: "😐 Belum Butuh", next: "HANDLE_NO_NEED" },
    ],
  },
  EXPLAIN_PRODUCT: {
    id: "EXPLAIN_PRODUCT",
    text: "Bagus sekali. Untuk limit yang kami tawarkan bisa sampai 500 Juta dengan tenor fleksibel hingga 5 tahun. Prosesnya hanya butuh KTP dan cair dalam 1x24 jam.",
    options: [
      { label: "🤝 Deal / Setuju", next: "CLOSING_DEAL" },
      { label: "🤔 Pikir-pikir dulu", next: "SOFT_CLOSING" },
    ],
  },
  HANDLE_EXPENSIVE: {
    id: "HANDLE_EXPENSIVE",
    text: "Saya mengerti, Pak/Bu. Namun 0.8% ini adalah rate terendah di pasar saat ini khusus nasabah payroll. Di tempat lain rata-rata masih 1.2% ke atas. Boleh saya simulasikan cicilannya agar terlihat lebih ringan?",
    options: [
      { label: "✅ Boleh", next: "EXPLAIN_PRODUCT" },
      { label: "⛔ Tetap Gak Mau", next: "END_REJECT" },
    ],
  },
  HANDLE_NO_NEED: {
    id: "HANDLE_NO_NEED",
    text: "Tidak masalah Pak/Bu. Fasilitas ini sifatnya pre-approved, jadi bisa diambil kapan saja dalam 3 bulan ke depan. Boleh saya kirimkan detailnya via WhatsApp untuk dibaca-baca dulu?",
    options: [
      { label: "✅ Boleh WA", next: "WA_PERMIT" },
      { label: "⛔ Tidak Usah", next: "END_REJECT" },
    ],
  },
  CLOSING_DEAL: {
    id: "CLOSING_DEAL",
    text: "Alhamdulillah. Saya bantu proses pengajuannya sekarang ya Pak/Bu. Mohon konfirmasi NIK dan alamat emailnya.",
    isEnd: true,
  },
  WA_PERMIT: {
    id: "WA_PERMIT",
    text: "Baik, saya kirimkan brosurnya ke nomor ini ya. Terima kasih banyak atas waktunya, selamat beraktivitas kembali.",
    isEnd: true,
  },
  RESCHEDULE: {
    id: "RESCHEDULE",
    text: "Siap, saya catat untuk menghubungi kembali di waktu tersebut. Terima kasih, selamat pagi/siang.",
    isEnd: true,
  },
  END_REJECT: {
    id: "END_REJECT",
    text: "Baik Pak/Bu, terima kasih sudah menerima telepon kami. Selamat beraktivitas.",
    isEnd: true,
  },
};

export default function CallInterface({ customer, onClose, onSave }) {
  const [duration, setDuration] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [note, setNote] = useState(customer.notes || "");
  const [callStatus, setCallStatus] = useState("connected");
  const [activeTab, setActiveTab] = useState("script");
  const [isMinimized, setIsMinimized] = useState(false);

  // REMINDER STATE
  const [showReminder, setShowReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState("");

  // SCRIPT ENGINE STATE
  const [currentStepId, setCurrentStepId] = useState("START");
  const [scriptHistory, setScriptHistory] = useState(["START"]);

  const currentStep = SCRIPT_FLOW[currentStepId];

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval = null;
    if (isActive && callStatus === "connected") {
      interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, callStatus]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
  };

  // --- SCRIPT HANDLERS ---
  const handleScriptOption = (nextId) => {
    if (SCRIPT_FLOW[nextId]) {
      setScriptHistory([...scriptHistory, nextId]);
      setCurrentStepId(nextId);
    }
  };

  const handleScriptBack = () => {
    if (scriptHistory.length > 1) {
      const newHistory = [...scriptHistory];
      newHistory.pop();
      const prevId = newHistory[newHistory.length - 1];
      setScriptHistory(newHistory);
      setCurrentStepId(prevId);
    }
  };

  const handleResetScript = () => {
    setCurrentStepId("START");
    setScriptHistory(["START"]);
  };

  // --- SAVE LOGIC ---
  const handleActionClick = (status) => {
    if (status === 'in_progress') {
      // BUKA MODAL REMINDER
      setShowReminder(true);
    } else {
      // LANGSUNG SIMPAN
      handleEndCall(status);
    }
  };

  const handleEndCall = async (finalStatus, customNote = null) => {
    setIsActive(false);
    setCallStatus("ended");
    
    if (finalStatus === 'success') {
      triggerConfetti();
    }

    // Gunakan customNote jika ada (dari reminder), jika tidak pakai state note biasa
    const finalNote = customNote 
      ? customNote + `\n[Call Duration: ${formatTime(duration)}]`
      : note + `\n[Call Duration: ${formatTime(duration)}]`;

    try {
      await updateLeadStatus(customer.id, {
        status: finalStatus,
        notes: finalNote
      });
      setTimeout(() => {
        if(onSave) onSave();
        onClose();
      }, 800);
    } catch (err) {
      alert("Gagal menyimpan data.");
      setIsActive(true);
    }
  };

  // Logic Simpan Reminder
  const confirmReminder = () => {
    if (!reminderDate) {
      alert("Pilih tanggal dan jam dulu!");
      return;
    }
    const formattedDate = new Date(reminderDate).toLocaleString("id-ID", { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
    
    // Append Reminder ke Note
    const noteWithReminder = note + `\n\n⏰ REMINDER: Hubungi kembali pada ${formattedDate}`;
    
    handleEndCall('in_progress', noteWithReminder);
  };

  // --- VIEW 1: MINIMIZED ---
  if (isMinimized) {
    return (
      <div 
        className="call-window-minimized group"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="call-avatar-lg !w-8 !h-8 !text-xs">
              {customer.name.charAt(0)}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-800 ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
          </div>
          <div className="flex flex-col">
            <span className="text-main font-bold text-sm truncate w-32 group-hover:text-indigo-600 transition-colors">{customer.name}</span>
            <span className="text-muted text-xs font-mono">{formatTime(duration)}</span>
          </div>
        </div>
        <button className="control-icon !w-8 !h-8">⤢</button>
      </div>
    );
  }

  // --- VIEW 2: MAXIMIZED ---
  return (
    <div className="call-window relative">
      
      {/* --- MODAL REMINDER (OVERLAY) --- */}
      {showReminder && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-theme p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              ⏰
            </div>
            <h3 className="text-lg font-bold text-main mb-1">Jadwalkan Follow Up</h3>
            <p className="text-xs text-muted mb-4">Kapan Anda ingin menghubungi {customer.name} lagi?</p>
            
            <input 
              type="datetime-local" 
              className="input-field mb-6 text-center font-bold"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
            />
            
            <div className="flex gap-2">
              <button 
                onClick={() => setShowReminder(false)} 
                className="flex-1 btn btn-ghost"
              >
                Batal
              </button>
              <button 
                onClick={confirmReminder} 
                className="flex-1 btn btn-primary"
              >
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="call-header">
        <div className="flex items-center gap-4">
          <div className="call-avatar-lg">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-main font-bold text-base leading-tight">{customer.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-xs text-muted font-medium">{customer.job}</span>
               <span className={`text-[10px] font-bold uppercase tracking-wider ${callStatus === 'connected' ? 'text-emerald-500 animate-pulse' : 'text-red-500'}`}>
                 {callStatus === 'connected' ? '● Live Call' : '● Ended'}
               </span>
            </div>
          </div>
        </div>

        {/* TIMER */}
        <div className="call-timer-pill">
           <span className="call-timer-text">
             {formatTime(duration)}
           </span>
        </div>

        {/* CONTROLS */}
        <div className="flex gap-2">
          <button onClick={() => setIsMinimized(true)} className="control-icon text-sm">─</button>
          <button onClick={onClose} className="control-icon hover:bg-red-50 hover:text-red-500 text-sm">✕</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* KOLOM KIRI */}
        <div className="call-col-left">
           <div className="flex border-b border-theme px-6">
              <button onClick={() => setActiveTab('script')} className={`call-tab-btn ${activeTab==='script'?'active':''}`}>Interactive Script</button>
              <button onClick={() => setActiveTab('info')} className={`call-tab-btn ${activeTab==='info'?'active':''}`}>Customer Info</button>
           </div>
           
           <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col">
              {activeTab === 'script' ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="call-step-badge">
                        STEP: {currentStepId.replace(/_/g, " ")}
                      </span>
                      {scriptHistory.length > 1 && (
                        <button onClick={handleScriptBack} className="text-xs text-brand-primary hover:underline font-bold">
                          ↩ Back
                        </button>
                      )}
                    </div>
                    <div className="call-script-bubble">
                      <p className="call-script-text">
                        "{currentStep.text.replace("[Name]", customer.name).replace("[SalesName]", "Saya")}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-muted uppercase mb-2">Respon Nasabah:</p>
                    {currentStep.options ? (
                      <div className="grid grid-cols-1 gap-2">
                        {currentStep.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleScriptOption(opt.next)}
                            className="call-script-btn"
                          >
                            <span className="call-script-btn-label">
                              {opt.label}
                            </span>
                            <span className="text-muted text-xs transition-transform group-hover:translate-x-1">➝</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="call-script-end">
                        <p className="font-bold text-lg mb-2">🏁 Script Selesai</p>
                        <p className="text-xs opacity-80 mb-4">Silakan simpan status panggilan di panel kanan.</p>
                        <button onClick={handleResetScript} className="text-xs underline hover:opacity-100 opacity-60">
                          Ulangi dari Awal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="call-card-glass">
                      <label className="text-xs text-muted block mb-1">Pekerjaan</label>
                      <div className="font-bold text-main">{customer.job}</div>
                   </div>
                   <div className="call-card-glass">
                      <label className="text-xs text-muted block mb-1">Umur</label>
                      <div className="font-bold text-main">{customer.age} Tahun</div>
                   </div>
                    <div className="call-card-glass">
                      <label className="text-xs text-muted block mb-1">Score</label>
                      <div className="font-bold text-emerald-500 text-xl">{Math.round(customer.score*100)}%</div>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="call-col-right">
           <div className="call-notepad-header">
              <span>Quick Notes</span>
              <span className="opacity-70">{note.length} chars</span>
           </div>
           <textarea 
             className="call-textarea" 
             placeholder="Ketik poin penting pembicaraan di sini..."
             value={note}
             onChange={e => setNote(e.target.value)}
           />
           
           <div className="p-4 grid grid-cols-2 gap-3 border-t border-theme bg-card">
              <button onClick={() => handleActionClick('success')} className="btn-action bg-emerald-600 hover:bg-emerald-500">
                 ✅ Deal
              </button>
              {/* BUTTON FOLLOW UP MEMICU MODAL REMINDER */}
              <button onClick={() => handleActionClick('in_progress')} className="btn-action bg-amber-500 hover:bg-amber-400">
                 📞 Follow Up
              </button>
              <button onClick={() => handleActionClick('failed')} className="btn-action bg-rose-600 hover:bg-rose-500">
                 ⛔ Gagal
              </button>
              <button onClick={() => handleActionClick('voicemail')} className="btn-action bg-slate-500 hover:bg-slate-400">
                 📼 Voicemail
              </button>
           </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="call-footer">
         <button className="control-icon" title="Mute">🎙️</button>
         <button 
           onClick={() => handleActionClick(customer.status)}
           className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-500 hover:scale-105 transition-all"
         >
           <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
         </button>
         <button className="control-icon" title="Keypad">⌨️</button>
      </div>
    </div>
  );
}