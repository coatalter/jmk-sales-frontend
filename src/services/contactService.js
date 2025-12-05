const STORAGE_KEY = "jmk_sales_metadata";
const LOG_KEY = "jmk_sales_logs"; 

// --- METADATA (STATUS & NOTES) ---
export const getAllMetadata = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};
 
export const getMetadata = (id) => {
  const all = getAllMetadata();
  return all[id] || { subscribed: null, notes: "" };
};

// Fungsi simpan kontak + Otomatis catat LOG
export const setContact = (id, data, salesName = "Anda") => {
  const all = getAllMetadata();
  // Simpan metadata (Status & Note)
  all[id] = { 
    ...all[id], 
    ...data, 
    lastContacted: new Date().toISOString() 
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  // --- FITUR 5: CATAT LOG OTOMATIS ---
  let actionText = "Memperbarui data";
  if (data.subscribed === true) actionText = "Berhasil closing (Berlangganan)";
  else if (data.subscribed === false) actionText = "Menandai status Menolak";
  else if (data.notes) actionText = "Menambahkan catatan baru";

  addLog({
    user: salesName,
    action: actionText,
    target: `Prospek #${id}`,
    time: new Date().toISOString()
  });
};

// --- LOGGING SYSTEM ---
export const getLogs = () => {
  const logs = localStorage.getItem(LOG_KEY);
  return logs ? JSON.parse(logs) : [];
};

export const addLog = (logItem) => {
  const logs = getLogs();
  // Tambah log baru di paling atas (unshift)
  // Simpan max 50 log terakhir biar ga berat
  const newLogs = [logItem, ...logs].slice(0, 50);
  localStorage.setItem(LOG_KEY, JSON.stringify(newLogs));
};