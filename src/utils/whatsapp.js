export const getWhatsAppLink = (phone, name) => {
  if (!phone) return "";

  // 1. Bersihkan karakter non-digit (spasi, strip, dll)
  let cleanPhone = phone.replace(/\D/g, '');

  // 2. Ubah '0' di depan menjadi '62' (Kode Negara Indonesia)
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }

  // 3. Pesan Template (Pre-filled message)
  // Pesan ini akan otomatis terketik di kolom chat sales
  const message = `Halo Bapak/Ibu ${name}, perkenalkan saya dari Tim Sales JMK. Saya ingin menginfokan penawaran khusus untuk Anda. Apakah ada waktu luang untuk diskusi sebentar?`;

  // 4. Return URL lengkap
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const openWhatsApp = (phone, name) => {
  const link = getWhatsAppLink(phone, name);
  if (link) {
    window.open(link, '_blank');
  } else {
    alert("Nomor telepon tidak valid/kosong.");
  }
};