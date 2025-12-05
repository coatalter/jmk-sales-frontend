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
      // Panggil service auth
      const user = await authenticate(email.trim(), password);

      if (!user) {
        // Jika return null/false dari service
        throw new Error("Login gagal. Periksa email atau password.");
      }

      // Login Sukses -> Redirect berdasarkan role
      if (user.role === "superadmin") {
        nav("/superadmin", { replace: true });
      } else if (user.role === "sales") {
        nav("/sales", { replace: true });
      } else {
        // Fallback jika role tidak dikenali
        nav("/", { replace: true });
      }

    } catch (err) {
      console.error(err);
      // Cek apakah error koneksi (biasanya ERR_FAILED / Network Error)
      if (err.message === "Network Error" || err.message.includes("failed")) {
        setError("Gagal terhubung ke Server. Pastikan Backend menyala.");
      } else {
        setError("Email atau Password salah.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 transition-colors duration-300">
      
      {/* Container Card */}
      <div className="w-full max-w-md card border-t-4 border-t-indigo-600">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/30 mx-auto mb-4">
            J
          </div>
          <h2 className="text-2xl font-bold text-main">Selamat Datang</h2>
          <p className="text-muted text-sm mt-2">Masuk ke Dashboard JMK Sales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Input Email */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="input-field" 
              placeholder="nama@bank.co.id" 
              required
              disabled={isLoading}
            />
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
              Password
            </label>
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

          {/* Error Message Box */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}
          
          {/* Submit Button */}
          <button   
            type="submit" 
            className="w-full btn btn-primary py-3 text-base shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Memproses...
              </span>
            ) : "Masuk Sekarang"}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-muted">
            Belum punya akun? Hubungi <span className="font-bold text-indigo-600 dark:text-indigo-400">Superadmin</span>.
          </p>
        </div>
      </div>
    </div>
  );
}