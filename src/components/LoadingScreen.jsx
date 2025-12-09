import React, { useState, useEffect } from "react";

const quotes = [
  "🚀 Menyiapkan data penjualan terbaik Anda...",
  "💰 Closing adalah seni, dan Anda senimannya...",
  "📈 Menganalisa peluang profit hari ini...",
  "☕ Seduh kopi dulu, data sedang dimuat...",
  "🔥 Sales yang hebat tidak menunggu peluang, tapi menciptakannya...",
  "💎 Menghubungkan ke Database Railway...",
];

export default function LoadingScreen() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  // 1. DEFAULT STATE: FALSE (LIGHT MODE)
  // Ini kunci agar saat refresh, dia mulai dari Putih (Light) dulu.
  const [isDark, setIsDark] = useState(false); 

  useEffect(() => {
    // 2. Cek LocalStorage
    // HANYA berubah jadi gelap jika user pernah set ke 'dark' sebelumnya.
    const savedTheme = localStorage.getItem("theme"); 
    
    if (savedTheme === "dark") {
      setIsDark(true);
    } else {
      setIsDark(false); 
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // 3. DEFINE WARNA MANUAL (ZINC VERSION)
  // Saya sesuaikan Slate -> Zinc agar cocok dengan index.css Anda yang baru.
  const colors = {
    // Background: Zinc-950 (Hitam Pekat) vs Zinc-200 (Abu lembut)
    bg: isDark ? "bg-zinc-950" : "bg-zinc-200",
    
    // Text
    textMain: isDark ? "text-zinc-100" : "text-zinc-900",
    textSub: isDark ? "text-zinc-500" : "text-zinc-600",
    
    // Elements
    ringOuter: isDark ? "border-indigo-900/30" : "border-indigo-200",
    circleInner: isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-300",
    barBg: isDark ? "bg-zinc-900" : "bg-zinc-300"
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-colors duration-300 ${colors.bg}`}>
      
      {/* 1. ANIMASI LOGO */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Ring Luar */}
        <div className={`absolute w-32 h-32 rounded-full border-4 border-t-indigo-600 animate-spin ${colors.ringOuter}`}></div>
        
        {/* Lingkaran Tengah */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg animate-pulse relative z-10 border ${colors.circleInner}`}>
          <span className="text-4xl">💎</span>
        </div>

        {/* Glow Effect */}
        <div className="absolute w-20 h-20 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
      </div>

      {/* 2. LOADING BAR */}
      <div className={`w-64 h-1.5 rounded-full overflow-hidden mb-6 relative ${colors.barBg}`}>
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 w-1/2 rounded-full animate-indeterminate"></div>
      </div>

      {/* 3. KATA-KATA MOTIVASI */}
      <div className="h-10 flex items-center justify-center max-w-md px-4">
        <p className={`text-sm font-medium text-center animate-fade-in transition-all duration-500 ${colors.textMain}`}>
          {quotes[quoteIndex]}
        </p>
      </div>

      {/* Footer */}
      <div className={`absolute bottom-10 text-xs opacity-70 ${colors.textSub}`}>
        JMK Sales Dashboard
      </div>
    </div>
  );
}