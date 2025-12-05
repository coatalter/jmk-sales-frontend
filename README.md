# ⚛️ JMK Sales Frontend (Client)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **Antarmuka pengguna (UI) modern untuk JMK Sales Dashboard.**

Aplikasi klien ini dibangun menggunakan React (Vite) untuk memberikan pengalaman manajemen prospek yang responsif, interaktif, dan berbasis data real-time yang terhubung ke JMK Backend API.

---

## 🛠️ Stack & Libraries

Frontend ini menggunakan kumpulan teknologi modern untuk performa dan estetika.

### Core
* **Framework:** React.js 18+ (via Vite)
* **Routing:** React Router DOM v6
* **State Management:** React Context API / Custom Hooks
* **HTTP Client:** Axios (untuk komunikasi dengan Backend API)

### UI & Styling
* **Styling Engine:** Tailwind CSS
* **Icons:** Lucide React
* **Charts/Visualisasi:** Recharts (Pie & Bar charts)
* **Components:** Headless UI / Custom Components

---

## 📂 Struktur Direktori

Berikut adalah struktur folder utama dalam aplikasi frontend ini:

```text
client/
├── public/          # Aset statis (favicon, logo)
├── src/
│   ├── components/  # Komponen UI Reusable (Button, Card, Modal, Tables)
│   ├── contexts/    # Global State (AuthContext untuk login, ThemeContext untuk dark mode)
│   ├── hooks/       # Custom Hooks (useFetch, useAuth)
│   ├── layouts/     # Layout utama (Sidebar, Header wrapper)
│   ├── pages/       # Halaman aplikasi (Dashboard, Leads, Login, CustomerDetail)
│   ├── services/    # Konfigurasi API & Axios endpoints
│   ├── utils/       # Fungsi helper (formatter mata uang, tanggal)
│   └── main.jsx     # Entry point React
├── .env             # Variabel lingkungan (Environment Variables)
└── tailwind.config.js # Konfigurasi Tailwind
