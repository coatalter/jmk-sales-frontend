import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticate } from "../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await authenticate(email.trim(), password);

      if (!user) {
        throw new Error("Login gagal. Periksa email atau password.");
      }

      setTimeout(() => {
        if (user.role === "superadmin") {
          nav("/superadmin", { replace: true });
        } else if (user.role === "sales") {
          nav("/sales", { replace: true });
        } else {
          nav("/", { replace: true });
        }
      }, 800);

    } catch (err) {
      console.error(err);
      if (err.message === "Network Error" || err.message.includes("failed")) {
        setError("Gagal terhubung ke Server. Pastikan Backend menyala.");
      } else {
        setError("Email atau Password salah.");
      }
      setIsLoading(false);
    }
  };

  return (
    // Container utama tidak perlu warna, karena <body> di index.css sudah punya var(--bg-body)
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decoration (Opsional, tetap pakai opacity rendah agar aman di dark/light) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* CARD: Menggunakan class 'card' dari index.css yang otomatis berubah warna */}
      <div className="w-full max-w-md card border-t-4 border-t-indigo-600 relative z-10 animate-fade-in-up">
        
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-indigo-500/30 mx-auto mb-4 transform hover:scale-105 transition-transform duration-300">
            💎
          </div>
          {/* Menggunakan text-main */}
          <h2 className="text-2xl font-bold text-main tracking-tight">Selamat Datang</h2>
          {/* Menggunakan text-muted */}
          <p className="text-muted text-sm mt-2">Masuk untuk mengelola penjualan Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Input Email */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-2">
              Email Perusahaan
            </label>
            {/* Menggunakan class input-field */}
            <input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="input-field" 
              placeholder="nama@perusahaan.com" 
              required
              disabled={isLoading}
            />
          </div>

          {/* Input Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-muted uppercase tracking-wide">
                Password
              </label>
              <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 hover:underline">Lupa sandi?</a>
            </div>
            {/* Menggunakan class input-field */}
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="input-field" 
              placeholder="••••••••" 
              required
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}
          
          {/* Submit Button: Menggunakan btn-primary */}
          <button   
            type="submit" 
            className="w-full btn btn-primary py-3.5 text-base shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Memproses...
              </span>
            ) : "Masuk Sekarang"}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-dashed border-theme text-center">
          <p className="text-sm text-muted">
            Belum punya akun? <span className="font-bold text-indigo-600 cursor-pointer hover:underline">Hubungi Admin</span>.
          </p>
        </div>
      </div>
      
      {/* Footer Copyright */}
      <div className="absolute bottom-6 text-xs text-muted opacity-60">
        © 2025 JMK Sales Dashboard. All rights reserved.
      </div>
    </div>
  );
}