import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName = "Laporan-Sales") => {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diexport.");
    return;
  }

  // 1. Format Data (Cleaning)
  // Kita rapikan data agar kolom Excel-nya enak dibaca
  const cleanData = data.map(item => ({
    "ID Nasabah": item.id,
    "Nama Lengkap": item.name,
    "Pekerjaan": item.job,
    "Umur": item.age,
    "Skor Potensi": `${Math.round(item.score * 100)}%`,
    "Status": item.status.toUpperCase(),
    "Kontak Terakhir": item.lastContacted 
      ? new Date(item.lastContacted).toLocaleDateString('id-ID') 
      : "-",
    "Nomor HP": item.raw?.phone || "-",
    "Catatan": item.notes || "-"
  }));

  // 2. Buat Worksheet
  const worksheet = XLSX.utils.json_to_sheet(cleanData);

  // 3. Atur Lebar Kolom (Optional, biar rapi)
  const wscols = [
    { wch: 15 }, // ID
    { wch: 25 }, // Nama
    { wch: 20 }, // Pekerjaan
    { wch: 10 }, // Umur
    { wch: 15 }, // Skor
    { wch: 15 }, // Status
    { wch: 20 }, // Tanggal
    { wch: 15 }, // HP
    { wch: 50 }, // Catatan
  ];
  worksheet['!cols'] = wscols;

  // 4. Buat Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Sales");

  // 5. Download File
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0,10)}.xlsx`);
};