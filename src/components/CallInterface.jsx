import React, { useState, useEffect, useMemo } from "react";
import { updateLeadStatus } from "../services/leadsService";

export default function CallInterface({ customer, onClose, onSave }) {
  const [duration, setDuration] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [note, setNote] = useState(customer.notes || "");
  const [callStatus, setCallStatus] = useState("connected");
  const [activeTab, setActiveTab] = useState("script");
  const [isMinimized, setIsMinimized] = useState(false);

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

  const scripts = useMemo(() => {
    const isHot = customer.score >= 0.7;
    return {
      opener: isHot 
        ? `Halo Bapak/Ibu ${customer.name}, selamat pagi. Saya lihat Anda baru saja mengecek simulasi kredit...`
        : `Halo Bapak/Ibu ${customer.name}, perkenalkan saya dari JMK Bank...`,
      pitch: "Kami memiliki penawaran bunga khusus bulan ini...",
      closing: "Jika setuju, saya bantu proses sekarang ya Pak/Bu?"
    };
  }, [customer]);

  const handleEndCall = async (finalStatus) => {
    setIsActive(false);
    setCallStatus("ended");
    try {
      await updateLeadStatus(customer.id, {
        status: finalStatus,
        notes: note + `\n[Call Duration: ${formatTime(duration)}]`
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
        <button className="control-icon !w-8 !h-8">
           ⤢
        </button>
      </div>
    );
  }

  // --- VIEW 2: MAXIMIZED ---
  return (
    <div className="call-window">
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
        {/* KIRI */}
        <div className="call-col-left">
           <div className="flex border-b border-theme px-6">
              <button onClick={() => setActiveTab('script')} className={`call-tab-btn ${activeTab==='script'?'active':''}`}>Smart Script</button>
              <button onClick={() => setActiveTab('info')} className={`call-tab-btn ${activeTab==='info'?'active':''}`}>Customer Info</button>
           </div>
           
           <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              {activeTab === 'script' ? (
                <div className="space-y-4">
                  <div className="call-card-glass">
                    <h3 className="call-card-label">01. Pembuka</h3>
                    <p className="call-card-text">"{scripts.opener}"</p>
                  </div>
                  <div className="call-card-glass">
                    <h3 className="call-card-label">02. Penawaran</h3>
                    <p className="call-card-text">"{scripts.pitch}"</p>
                  </div>
                   <div className="call-card-glass !border-emerald-200 dark:!border-emerald-900/30">
                    <h3 className="call-card-label !text-emerald-600">03. Closing</h3>
                    <p className="call-card-text">"{scripts.closing}"</p>
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

        {/* KANAN */}
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
           
           {/* Action Buttons Grid */}
           <div className="p-4 grid grid-cols-2 gap-3 border-t border-theme bg-card">
              <button onClick={() => handleEndCall('success')} className="btn-action bg-emerald-600 hover:bg-emerald-500">
                 ✅ Deal
              </button>
              <button onClick={() => handleEndCall('in_progress')} className="btn-action bg-amber-500 hover:bg-amber-400">
                 📞 Follow Up
              </button>
              <button onClick={() => handleEndCall('failed')} className="btn-action bg-rose-600 hover:bg-rose-500">
                 ⛔ Gagal
              </button>
              <button onClick={() => handleEndCall('voicemail')} className="btn-action bg-slate-500 hover:bg-slate-400">
                 📼 Voicemail
              </button>
           </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="call-footer">
         <button className="control-icon" title="Mute">🎙️</button>
         
         <button 
           onClick={() => handleEndCall(customer.status)}
           className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-500 hover:scale-105 transition-all"
         >
           <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
         </button>
         
         <button className="control-icon" title="Keypad">⌨️</button>
      </div>
    </div>
  );
}