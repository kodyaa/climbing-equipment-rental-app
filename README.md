# SummitRent by Kodya

**SummitRent by Kodya** adalah aplikasi manajemen penyewaan peralatan pendakian gunung dan berkemah (hiking) premium. Dibangun di atas web stack modern, aplikasi ini menawarkan portal yang efisien bagi agen penyewaan outdoor untuk mengelola akun kasir/admin, melacak inventaris alat, menetapkan tarif harga sewa, dan mengelola status peralatan.

---

## 🚀 Teknologi yang Digunakan

- **Backend Framework:** Laravel 13 (PHP 8.4)
- **Frontend SPA Layer:** Inertia.js v3 (React + TypeScript)
- **Styling & Tema:** Tailwind CSS v4 (mengintegrasikan warna OKLCH, container queries)
- **Arsitektur UI:** Komponen Radix & Shadcn UI yang disesuaikan secara kustom
- **Framework Pengujian:** PHPUnit 12

---

## ✨ Fitur Utama

### 1. Manajemen Akun (Kasir & Admin)
- **Operasi CRUD:** Sistem lengkap untuk menambah, mengubah, dan menghapus akun staf (Admin & Kasir).
- **Unggah Foto Profil:** Unggah gambar secara langsung yang diproses dan disimpan dengan aman pada disk penyimpanan publik Laravel.
- **Avatar DiceBear Micah:** Integrasi **API DiceBear 9.x Micah** modern untuk pembuatan avatar vektor otomatis berdasarkan nama pengguna:
  - Navigasi menggunakan tombol Kiri/Kanan untuk mengganti seed varian.
  - Kustomisasi ekspresi mulut (senyum, cemberut, manyun, seringai, dll.) dan warna pakaian.
  - Latar belakang mendukung pola linear-gradient, warna preset, dan pemilih warna kustom (color picker).
- **Pemuatan Asinkron Terbangguhkan (Deferred Props):** Menggunakan fitur deferred props dari Inertia v3 untuk menampilkan mockup **Skeleton Table** yang sangat detail dan presisi, mencocokkan kolom tabel, paginasi, dan filter asli saat halaman dimuat.
- **Perlindungan Keamanan:** Proteksi penghapusan diri mencegah admin yang sedang login menghapus akun mereka sendiri secara tidak sengaja.

### 2. Inventaris Sewa (Produk)
- **Filter Kategori Dinamis:** Kelompokkan produk berdasarkan Tenda, Ransel, Kantong Tidur, Alas Kaki, Peralatan Memasak, dan Alat Panjat.
- **Pencarian & Pengurutan Sisi Server:** Sinkronisasi parameter query secara real-time (pencarian teks, pengurutan tarif sewa, tanggal dibuat, atau stok) yang didebounce selama `400ms` untuk interaksi yang responsif.
- **Pelacakan Stok:** Badge berwarna yang menunjukkan status ketersediaan barang (`Available` / Tersedia, `Maintenance` / Perawatan, `Out of Stock` / Habis).
- **Skeleton Kartu Asinkron:** Memuat katalog produk di latar belakang menggunakan deferred props, merender grid berupa mockup **Skeleton Card** yang berdenyut dengan blok gambar, judul, harga sewa, dan stok yang presisi.

### 3. Poles & Animasi Premium
- **Transisi Tema Circular Reveal (Ripple):** Peralihan tema (Terang/Gelap/Sistem) modern yang melakukan efek lingkaran melingkar (ripple) yang berpusat pada koordinat klik mouse pengguna, didukung oleh **View Transitions API** (`document.startViewTransition`) dan animasi `flushSync`.
- **Bebas Kedipan Tema (Glitch-Free):** Sinkronisasi preferensi tema pengguna dijalankan secara inline di dalam tag `<head>` sebelum parsing dokumen HTML dilakukan. Hal ini mencegah kedipan warna putih (FOUC) saat memuat ulang halaman.

---

## 🛠️ Instalasi & Konfigurasi (Tanpa Docker / Local Host)

1. **Kloning & Instal Dependensi:**
   ```bash
   composer install
   npm install
   ```

2. **Konfigurasi Lingkungan (.env):**
   Salin file `.env.example` ke `.env` dan generate application key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Buka file `.env` yang baru dibuat dan pastikan parameter koneksi database Anda telah disesuaikan untuk menggunakan **PostgreSQL**:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=rentalapp
   DB_USERNAME=rentalapp_user
   DB_PASSWORD=rentalapp_password
   ```
   *(Catatan: Jika Anda menggunakan Docker Compose untuk development lokal, host database `DB_HOST` akan diatur secara otomatis ke service database `db` di dalam kontainer)*

3. **Buat Tautan Penyimpanan Publik:**
   ```bash
   php artisan storage:link
   ```

4. **Inisialisasi Database & Seeding Data:**
   ```bash
   php artisan migrate:fresh --seed
   ```
   *Data seeder mencakup:*
   - Akun administrator default (`admin@example.com` / `password`).
   - Akun kasir yang dilengkapi URL avatar vektor DiceBear.
   - 12 produk pendakian gunung berkualitas tinggi dengan gambar Unsplash asli.

5. **Jalankan Server Pengembangan:**
   - Jalankan backend Laravel:
     ```bash
     php artisan serve
     ```
   - Jalankan Vite development server:
     ```bash
     npm run dev
     ```

---

## 🐳 Konfigurasi Docker & Docker Compose (Laravel Octane & FrankenPHP)

Aplikasi ini dilengkapi dengan konfigurasi kontainerisasi siap pakai berkinerja tinggi menggunakan **Laravel Octane** bertenaga **FrankenPHP** (menggunakan base image berbasis Debian). Konfigurasi ini terbagi menjadi dua lingkungan: development dan production.

### 1. Lingkungan Pengembangan Lokal (Development)
Menjalankan aplikasi dalam **mode watch (hot-reload)** dengan volume mounting direktori lokal:
- Bangun dan jalankan layanan:
  ```bash
  docker compose -f compose.dev.yaml up -d --build
  ```
- Lihat log kontainer secara live:
  ```bash
  docker compose -f compose.dev.yaml logs -f
  ```
- Jalankan pengujian di dalam kontainer yang sedang berjalan:
  ```bash
  docker compose -f compose.dev.yaml exec app php artisan test --compact
  ```
- Akses aplikasi secara lokal: Buka `http://localhost:8000` pada browser Anda.

### 2. Lingkungan Produksi (Production)
Menjalankan aplikasi dengan optimasi *caching* konfigurasi:
- Bangun dan jalankan layanan produksi:
  ```bash
  docker compose -f compose.prod.yaml up -d --build
  ```
- Jalankan pengujian di dalam kontainer produksi:
  ```bash
  docker compose -f compose.prod.yaml exec app php artisan test --compact
  ```

---

## 🧪 Pengujian & Verifikasi

### Pengujian Fitur Otomatis
Jalankan suite pengujian PHPUnit untuk memverifikasi aturan keamanan, batasan validasi data, dan aksi database:
```bash
php artisan test --compact
```

### Kompilasi Produksi
Lakukan bundling aset TypeScript dan Tailwind CSS untuk memverifikasi kesiapan rilis produksi:
```bash
npm run build
```

---

## ☕ Dukungan & Donasi

Jika Anda merasa proyek ini bermanfaat, Anda dapat mendukung pengembangannya dengan berdonasi melalui Saweria:

[![Donasi via Saweria](https://img.shields.io/badge/Donasi-Saweria-orange?style=for-the-badge&logo=coffee)](https://saweria.co/kodya)

Or scan kode QR di bawah ini:

<p align="center">
  <img src="public/images/saweria.jpg" width="200" alt="Kode QR Saweria">
</p>
