# 💼 FinOS UMKM — Sistem Pembukuan & Arus Kas Digital

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Demo-Live%20Website-success?logo=github)](https://olyxmintabansos-byte.github.io/buku-kas-umkm/)
[![Stack: Vanilla JS](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20ES6+-orange.svg)](https://olyxmintabansos-byte.github.io/buku-kas-umkm/)
[![Standard: Anti--AI--Slop](https://img.shields.io/badge/Craftsmanship-Anti--AI--Slop-purple.svg)](https://olyxmintabansos-byte.github.io/buku-kas-umkm/)

**FinOS UMKM** adalah aplikasi pembukuan dan manajemen arus kas digital (*financial OS*) modern yang dirancang khusus untuk pelaku usaha mikro, kecil, dan menengah (UMKM) di Indonesia. Dibangun menggunakan arsitektur **Local-First** murni (HTML5, CSS3, dan Vanilla JavaScript) tanpa dependensi library eksternal yang berat, aplikasi ini dapat diakses secara instan, aman, cepat, dan bekerja 100% di browser.

🔗 **Demo Live:** [https://olyxmintabansos-byte.github.io/buku-kas-umkm/](https://olyxmintabansos-byte.github.io/buku-kas-umkm/)

---

## ✨ Fitur Unggulan (Core Features)

### 1. 🧠 Executive Cash Flow Briefing (Ringkasan Cerdas Kas)
- Otomatis merangkum **5 transaksi terakhir** ke dalam narasi bahasa Indonesia yang natural.
- Menghitung **Net Flow** (Surplus/Defisit kas terkini) dan pos pengeluaran yang paling dominan.
- Memberikan **Rekomendasi Bisnis Cerdas**: saran konkret kapan harus memangkas biaya dan kapan aman mengalokasikan surplus ke tabungan.

### 2. 🧭 Sidebar Dashboard Multi-View
- Navigasi tetap di sebelah kiri (**Fixed 260px Sidebar**) dengan pemisahan kontras tinggi (*Deep Slate `#0f172a`*).
- Router SPA multi-halaman instan tanpa reload browser:
  - 📊 **Dashboard & Metrik**: Total saldo kas, Runway kas dalam hari/bulan, cadangan PPh Final 0.5%, dan grafik arus kas Canvas.
  - 📝 **Buku Kas & Mutasi**: Pencatatan kas harian, 4 tombol preset 1-klik, dan filter mutasi.
  - 👥 **Buku Hutang & Piutang**: Pelacakan hutang suplier dan piutang pelanggan dengan pengingat jatuh tempo dan integrasi pesan WhatsApp otomatis.
  - 👛 **Dompet & Multi-Kas**: Pemisahan saldo Kas Tunai Laci, Rekening Bank, dan QRIS/E-Wallet.
  - 📅 **Tagihan Rutin & Pajak**: Radar tagihan bulanan dan kalkulator estimasi PPh Final 0.5% UMKM (PP 55/2022).
  - 🎯 **Target Tabungan Usaha**: Pemantauan tabungan modal dan belanja alat dengan bilah progres visual.
  - 📑 **Laporan Finansial**: Laporan Laba Rugi bulanan siap cetak (*Print-Ready*).
  - 🎨 **Kustomisasi Sistem**: Live theme editor (nama usaha, warna aksen, dark mode, dan kelengkungan kartu).

### 3. ⚡ Quick Command Palette (`Ctrl + K` / `Cmd + K`)
- Tekan `Ctrl + K` di mana saja untuk memunculkan kotak pencarian instan untuk melompat antar menu tanpa menyentuh mouse.

### 4. 🧾 Generator Struk Kasir Thermal & Ekspor Data
- Cetak nota penjualan format kertas kasir thermal (80mm/58mm) atau kirim nota ke WhatsApp pelanggan.
- Ekspor seluruh riwayat transaksi ke format **Excel / CSV** (UTF-8 BOM).
- Backup & Restore database lokal via file **JSON**.

### 5. 🛡️ Desain Anti-AI Slop & Notifikasi Modern
- Menggunakan palet rona lembut (*Soft Tinted Washes*) yang nyaman di mata berjam-jam tanpa balok warna norak.
- Seluruh pop-up `alert()` kuno digantikan oleh **Floating Toast Notifikasi di pojok kanan atas**.
- Seluruh dialog `confirm()` digantikan oleh **Modal Konfirmasi di tengah layar** dengan latar belakang *frosted glass*.

---

## 🚀 Cara Menjalankan Secara Lokal

Karena aplikasi ini dibangun murni menggunakan teknologi web standar, tidak ada proses instalasi (`npm install` atau build step) yang diperlukan:

1. Clone repositori ini:
   ```bash
   git clone https://github.com/olyxmintabansos-byte/buku-kas-umkm.git
   ```
2. Buka folder proyek:
   ```bash
   cd buku-kas-umkm
   ```
3. Klik ganda file `index.html` untuk langsung membukanya di browser favoritmu (Chrome, Edge, Firefox, Safari)!

---

## 🔒 Privasi & Keamanan Data

Aplikasi ini mengusung filosofi **Local-First**. Seluruh data transaksi, catatan hutang-piutang, dan pengaturan toko tersimpan secara lokal di memori browser perangkatmu (*LocalStorage*). Data bisnismu tidak dikirim ke server pihak ketiga mana pun tanpa izinmu.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE). Bebas digunakan, dimodifikasi, dan didistribusikan untuk mendukung kemajuan UMKM Indonesia.
