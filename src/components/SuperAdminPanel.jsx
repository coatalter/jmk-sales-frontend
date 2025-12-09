import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./Layout";
import { getAuthToken } from "../services/authService";

const API_URL = "http://localhost:5001"; // Sesuaikan port

export default function SuperAdminPanel() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "sales" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" }); // Untuk notifikasi sukses/gagal

  // Fetch Users saat load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Kirim Token di Header (Authorization: Bearer <token>)
      // Walaupun backend kita tadi belum pasang middleware verify token strict,
      // ini best practice biar siap kalau backend diperketat.
      const token = getAuthToken();
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error("Gagal ambil user:", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      const token = getAuthToken();
      await axios.post(`${API_URL}/users`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMsg({ text: "Akun Sales berhasil dibuat!", type: "success" });
      setForm({ name: "", email: "", password: "", role: "sales" }); // Reset form
      fetchUsers(); // Refresh list
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal membuat akun.";
      setMsg({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus sales ini?")) return;
    try {
      const token = getAuthToken();
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Gagal menghapus user.");
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-main">Superadmin Control</h1>
        <p className="text-muted text-sm">Kelola akses tim sales JMK.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* FORM BUAT AKUN */}
        <div className="card h-fit">
          <h2 className="font-bold text-lg text-main mb-4">Buat Akun Sales Baru</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted uppercase mb-1">Nama Lengkap</label>
              <input 
                className="input-field" 
                value={form.name} 
                onChange={e => setForm({...form, name:e.target.value})} 
                placeholder="Contoh: Budi Sales" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted uppercase mb-1">Email</label>
              <input 
                className="input-field" 
                value={form.email} 
                onChange={e => setForm({...form, email:e.target.value})} 
                placeholder="sales@bank.co.id" 
                type="email"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted uppercase mb-1">Password</label>
              <input 
                className="input-field" 
                type="password" 
                value={form.password} 
                onChange={e => setForm({...form, password:e.target.value})} 
                placeholder="Minimal 6 karakter" 
                required 
              />
            </div>

            {msg.text && (
              <div className={`p-3 rounded-lg text-sm font-medium ${msg.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {msg.text}
              </div>
            )}

            <button type="submit" className="w-full btn btn-primary mt-2" disabled={loading}>
              {loading ? "Memproses..." : "Buat Akun Sales"}
            </button>
          </form>
        </div>

        {/* LIST USER */}
        <div className="card">
          <h2 className="font-bold text-lg text-main mb-4">Daftar Akun Sales ({users.length})</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {users.length === 0 && <div className="text-sm text-muted italic text-center py-10">Belum ada akun sales.</div>}
            
            {users.map(u => (
              <div key={u.user_id} className="flex items-center justify-between p-3 border border-theme rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-main text-sm">{u.name}</div>
                    <div className="text-xs text-muted">{u.email}</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(u.user_id)} 
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                  title="Hapus Akun"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}