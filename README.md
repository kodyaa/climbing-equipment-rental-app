# SummitRent by Kodya

**SummitRent by Kodya** adalah aplikasi manajemen penyewaan peralatan pendakian gunung dan berkemah (hiking) premium. Dibangun di atas web stack modern, aplikasi ini menawarkan portal yang efisien bagi agen penyewaan outdoor untuk mengelola akun kasir/admin, melacak inventaris alat, menetapkan tarif harga sewa, mengelola pelanggan, memproses transaksi sewa, dan menerima asisten AI secara real-time.

---

## 🚀 Teknologi yang Digunakan

- **Backend Framework:** Laravel 13 (PHP 8.4)
- **Frontend SPA Layer:** Inertia.js v3 (React + TypeScript)
- **Styling & Tema:** Tailwind CSS v4 (mengintegrasikan warna OKLCH, container queries)
- **Arsitektur UI:** Komponen Radix & Shadcn UI yang disesuaikan secara kustom
- **Real-Time WebSockets:** Laravel Reverb (Broadcasting & Echo)
- **AI Integration:** Laravel AI SDK (`laravel/ai`) & Ollama (`qwen2.5:3b`)
- **Pengujian & Pemformatan:** PHPUnit 12 & Laravel Pint

---

## ✨ Fitur Utama

### 1. Sistem Keamanan & Hak Akses (Spatie Roles & Permissions)
- **Pengamanan Rute Berlapis (Granular Route-Level Hardening):** Seluruh endpoint (Produk, Akun, Pelanggan, Transaksi Sewa) dilindungi secara ketat di tingkat rute menggunakan middleware permission Spatie (seperti `permission:customers.create`). Ini menggantikan penguncian role kasar bawaan (`role:owner|kasir`) untuk mencegah bypass API.
- **Manajemen Akun Terpadu:** Sistem CRUD lengkap dengan layout **3-kolom flex/grid** premium untuk mengonfigurasi profil dasar, peran (Owner vs Kasir), dan daftar centang permission Spatie granular.
- **Visibilitas Dinamis (UI-Backend Sync):** Menu sidebar, tombol aksi tabel, dan fungsionalitas halaman disembunyikan atau ditampilkan secara dinamis berdasarkan data peran dan izin pengguna yang dibagikan secara global via Inertia.
- **Lencana & Label Flat Dinamis:** Halaman Akun menampilkan peran dengan lencana berwarna (*badges*) dan menyusun daftar izin dalam format flat yang bersih berdasarkan metadata terjemahan lokalisasi.
- **Unggah Foto Profil & Avatar DiceBear:** 
  - Unggah gambar profil asli yang disimpan dengan aman pada disk penyimpanan publik Laravel.
  - Integrasi **API DiceBear 9.x Micah** untuk pembuatan avatar vektor otomatis berbasis nama: siklus seed (Kiri/Kanan), kustomisasi ekspresi mulut, pakaian, warna latar belakang preset, dan color picker kustom.
- **Pemuatan Asinkron Terbangguhkan (Deferred Props):** Menggunakan deferred props Inertia v3 untuk memuat tabel secara asinkron dengan visual **Skeleton Table** yang sangat detail saat halaman dimuat.

### 2. POS Transaksi Sewa & Kasir Pintar
- **Alur Checkout Lengkap:** Operator dapat menghitung total sewa secara otomatis, menerapkan potongan harga (*discounts*), memilih metode pembayaran (Cash / QRIS), memasukkan uang yang dibayarkan, dan menghitung kembalian atau sisa tagihan secara real-time.
- **Popover Date Pickers Premium:** Menggantikan input tanggal HTML bawaan browser dengan kalender popover (Shadcn Calendar) terintegrasi serta manipulasi tanggal yang kebal zona waktu memanfaatkan package `@internationalized/date`.
- **Pendaftaran Pelanggan Cepat:** Tombol pintasan langsung di dalam keranjang belanja untuk mendaftarkan pelanggan baru tanpa harus meninggalkan halaman kasir.

### 3. Manajemen Pelanggan (Customers)
- **Validasi KTP / NIK & Telepon:** Membatasi input nomor KTP/Passport tepat 16 digit angka dan nomor telepon sesuai format standar Indonesia.
- **Live Validasi Ketersediaan (Real-Time Checking):** Memvalidasi ketersediaan KTP (NIK) dan Email di database secara real-time saat pengguna mengetik, lengkap dengan indikator pemuatan spinner (`Loader2`) dan tanda centang hijau (`Check`) jika tersedia.
- **Overlay Cover Preview Identitas ("Preview Photo Timpa"):** Redesain kotak upload foto identitas dengan gambar *full-bleed* responsif dan efek hover overlay gelap (`backdrop-blur-[2px] bg-black/60`) untuk mengganti atau menghapus preview foto secara interaktif.

### 4. Inventaris Produk & Katalog
- **Filter Kategori Dinamis:** Kelompokkan produk berdasarkan Tenda, Ransel, Kantong Tidur, Alas Kaki, Peralatan Memasak, dan Alat Panjat.
- **Pencarian & Pengurutan Sisi Server:** Sinkronisasi parameter query secara real-time yang didebounce selama `400ms` untuk interaksi yang responsif.
- **Pelacakan Stok:** Badge berwarna yang menunjukkan status ketersediaan barang (`Available` / Tersedia, `Maintenance` / Perawatan, `Out of Stock` / Habis).
- **Skeleton Kartu Asinkron:** Memuat katalog produk di latar belakang dengan grid berupa mockup **Skeleton Card** yang berdenyut presisi.

### 5. Asisten AI & WebSockets Real-Time
- **Obrolan Asisten AI Berbasis Event:** Dialog asisten AI interaktif dengan layout belah (*split-pane*) premium. Menyimpan sesi chat secara lokal (`localStorage`), dan menyiarkan langkah berpikir AI secara real-time ("Proses Berpikir Asisten") serta hasil teks markdown via WebSocket.
- **Notifikasi Operasional Real-Time:** Penyiaran notifikasi instan via Laravel Reverb ke ikon lonceng header dengan unread badges untuk:
  - Peringatan stok produk menipis (*low-stock*).
  - Pembaruan status transaksi sewa (disewa, dikembalikan, dibatalkan).
  - Peringatan harian transaksi sewa yang terlambat (*overdue*).

### 6. Poles & Animasi Premium
- **Transisi Tema Circular Reveal (Ripple):** Peralihan tema (Terang/Gelap/Sistem) modern yang melakukan efek lingkaran melingkar (ripple) yang berpusat pada koordinat klik mouse pengguna, didukung oleh **View Transitions API** (`document.startViewTransition`) dan animasi `flushSync`.
- **Bebas Kedipan Tema (Glitch-Free):** Sinkronisasi preferensi tema pengguna dijalankan secara inline di dalam tag `<head>` sebelum parsing dokumen HTML dilakukan. Hal ini mencegah kedipan warna putih (FOUC) saat memuat ulang halaman.
- **Scrollbar Kustom Global:** Gaya scrollbar kustom adaptif dengan pewarnaan transparan premium yang mencocokkan mode terang/gelap secara otomatis.

---

## 🛠️ Instalasi & Konfigurasi (Tanpa Docker / Local Host)

1. **Kloning & Instal Dependensi:**
   ```bash
   git clone https://github.com/kodyaa/climbing-equipment-rental-app.git
   cd climbing-equipment-rental-app
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
   - Akun administrator default (`admin@kodya.id` / `password`).
   - Akun kasir default (`cashier@kodya.id` / `password`) yang dilengkapi izin khusus kasir.
   - 20 data pelanggan realistis Indonesia yang terpetakan ke kode wilayah administratif lengkap.
   - 12 produk pendakian gunung berkualitas tinggi dengan gambar Unsplash asli.

5. **Jalankan Server Pengembangan:**
   - Jalankan backend Laravel:
     ```bash
     php artisan serve
     ```
   - Jalankan Reverb WebSocket server (jika diperlukan untuk fitur chat/notifikasi):
     ```bash
     php artisan reverb:start
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
- Unduh dan jalankan model AI Qwen (Ollama) di dalam kontainer:
  ```bash
  docker exec -it rentalapp_ollama_dev ollama run qwen2.5:3b
  ```
  *(Catatan: Model AI `qwen2.5:3b` dibutuhkan agar fitur asisten AI di halaman obrolan dapat berfungsi)*
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

## ⚡ Integrasi Laravel Boost (Model Context Protocol)

Aplikasi ini menggunakan **Laravel Boost** (`laravel/boost`) di lingkungan development. Laravel Boost adalah tool asisten AI pengembang yang mengekspos API **Model Context Protocol (MCP)** secara aman, memungkinkan asisten AI (seperti Antigravity) membaca skema database secara instan, mengeksekusi query database secara interaktif, mendeteksi error logs terbaru, dan mencari dokumentasi resmi.

### Langkah-Langkah Instalasi & Aktivasi Laravel Boost:

1. **Instal Package sebagai Dependency Development:**
   Pastikan package sudah terinstal (sudah tercantum di `composer.json` dalam `"require-dev"`). Jika belum:
   ```bash
   composer require laravel/boost --dev
   ```

2. **Jalankan Instalasi Dependensi:**
   ```bash
   composer install
   ```

3. **Aktifkan Server Lokal:**
   Laravel Boost bekerja secara otomatis melalui auto-discovery saat server lokal Anda berjalan:
   ```bash
   php artisan serve
   ```
   *Asisten AI IDE Anda akan otomatis mendeteksi server lokal `http://127.0.0.1:8000` dan mengaktifkan set perkakas lazy-loaded MCP (seperti `database-schema`, `database-query`, `read-log-entries`, dan `search-docs`) untuk membantu Anda menulis dan men-debug kode secara instan!*

---

## 🧠 Agentic AI Skills (Shadcn/UI)

Aplikasi ini mendukung kemampuan agen kecerdasan buatan (**Agentic AI Skills**) untuk mempermudah perancangan, penataan, dan manipulasi UI menggunakan set instruksi terstandardisasi. Untuk mengaktifkan kemampuan penataan antarmuka menggunakan Shadcn UI pada asisten AI Anda:

Jalankan perintah berikut pada terminal lokal Anda:
```bash
npx skills add shadcn/ui
```
*Perintah ini akan menginstal set instruksi, template, dan referensi komponen Shadcn/UI ke dalam direktori lokal `.agents/skills/` agar asisten coding AI Anda dapat merancang antarmuka premium secara otomatis.*

---

## ⚡ Integrasi Shadcn MCP Server (Model Context Protocol)

Aplikasi ini mendukung **Shadcn MCP Server** yang memungkinkan asisten AI Anda (seperti Antigravity) berinteraksi langsung dengan komponen dari registri UI (seperti registri `shadcn/ui` bawaan atau registri kustom perusahaan Anda). 

Dengan mengaktifkan Shadcn MCP server, asisten AI Anda mendapatkan akses instan untuk mencari, menelusuri, dan memasang komponen langsung ke dalam codebase Anda melalui bahasa alami (misalnya: *"Tambahkan komponen button, dialog, dan card ke proyek saya"*).

### Cara Menghubungkan Shadcn MCP Server ke Antigravity IDE:

1. **Jalankan Inisialisasi Klien (Opsional):**
   ```bash
   npx shadcn@latest mcp init
   ```

2. **Periksa Konfigurasi Antigravity (`.gemini/settings.json`):**
   Pastikan file konfigurasi `.gemini/settings.json` di proyek Anda telah memuat setelan server `shadcn` sebagai berikut:
   ```json
   {
       "mcpServers": {
           "laravel-boost": {
               "command": "php",
               "args": ["artisan", "boost:mcp"]
           },
           "shadcn": {
               "command": "npx",
               "args": ["shadcn@latest", "mcp"]
           }
       }
   }
   ```

3. **Restart Asisten AI IDE Anda** dan coba berikan instruksi bahasa alami seperti:
   - *"Tampilkan seluruh komponen yang tersedia di registri shadcn"*
   - *"Tambahkan komponen button, dialog, dan card ke proyek saya"*
   - *"Buat halaman formulir kontak menggunakan komponen dari registri shadcn"*

---

## 🧪 Pengujian & Verifikasi

### Pengujian Fitur Otomatis
Jalankan suite pengujian PHPUnit untuk memverifikasi aturan keamanan, batasan validasi data, dan aksi database:
```bash
php artisan test --compact
```

### Pemformatan Kode
Jalankan Laravel Pint untuk memastikan seluruh standardisasi penulisan kode PHP tetap bersih dan rapi:
```bash
vendor/bin/pint --dirty --format agent
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
