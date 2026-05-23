# SummitRent by Kodya

**SummitRent by Kodya** is a premium mountain climbing and hiking equipment rental management application. Built on a modern web stack, it offers outdoor rental agencies a streamlined portal to manage administrative cashiers, track gear inventory, set custom rental price rates, and manage equipment status.

---

## 🚀 Technology Stack

- **Backend Framework:** Laravel 13 (PHP 8.4)
- **Frontend SPA Layer:** Inertia.js v3 (React + TypeScript)
- **Styling & Theme:** Tailwind CSS v4 (incorporating OKLCH colors, container queries)
- **UI Architecture:** Custom-styled Radix & Shadcn UI components
- **Testing Framework:** PHPUnit 12

---

## ✨ Features

### 1. Accounts Management (Cashiers & Admins)
- **CRUD Operations:** Comprehensive system to add, edit, and delete staff accounts (Admins & Cashiers).
- **Profile Photo Upload:** Direct image uploads processed and stored securely on Laravel's public storage disk.
- **DiceBear Micah Avatars:** Modern **DiceBear 9.x Micah API** integration supporting automatic avatar generation seeded with the user's name:
  - Cycle through variant seeds with Left/Right navigation.
  - Customize mouth expressions (smile, frown, pucker, smirk, etc.) and shirt colors.
  - Backdrop styles support linear gradients, presets, and a custom background color picker.
- **Deferred Asynchronous Loading:** Uses Inertia v3 deferred props to render a highly detailed **Skeleton Table** mockup matching the exact columns, pagination, and filters of the real table during page load.
- **Safety Safeguards:** Self-deletion protection prevents currently logged-in administrators from accidentally deleting their own accounts.

### 2. Rental Inventory (Products)
- **Dynamic Category Filtering:** Organize products into Tents, Backpacks, Sleeping Bags, Footwear, Cooking Gear, and Climbing Gear.
- **Server-Side Search & Sorting:** Real-time query parameter synchronization (searching by details, sorting by rate, date created, or stock) debounced at `400ms` for seamless interaction.
- **Stock Tracking:** Color-coded badges indicating availability (`Available`, `Maintenance`, `Out of Stock`).
- **Asynchronous Card Grid Skeletons:** Loads product catalogs in the background using deferred props, rendering a grid of pulsing **Skeleton Card** mockups with image, header, rates, and stock blocks.

### 3. Polish & Animations
- **Circular Reveal (Ripple) Theme Toggle:** Modern theme toggling (Light/Dark/System) that performs a seamless circular reveal animation centered at the user's mouse click coordinates, powered by the **View Transitions API** (`document.startViewTransition`) and `flushSync` animations.
- **Glitch-Free Hydration:** Syncs user theme preferences inline within the HTML `<head>` block before parsing the document body to prevent flashes of unstyled content (FOUC).

---

## 🛠️ Installation & Setup

1. **Clone & Install Dependencies:**
   ```bash
   composer install
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Link Public Storage:**
   ```bash
   php artisan storage:link
   ```

4. **Initialize Database & Seed Data:**
   ```bash
   php artisan migrate:fresh --seed
   ```
   *Seeder loads:*
   - Default administrators (`admin@example.com` / `password`).
   - Cashiers with pre-configured DiceBear vector avatar URLs.
   - 12 high-quality default climbing equipment items with real Unsplash images.

5. **Start Development Servers:**
   - Run Laravel backend:
     ```bash
     php artisan serve
     ```
   - Run Vite development server:
     ```bash
     npm run dev
     ```

---

## 🧪 Verification & Testing

### Automated Feature Tests
Execute the PHPUnit suite to verify the security rules, validation constraints, and database actions:
```bash
php artisan test --compact
```

### Production Compilation
Bundle the TypeScript and Tailwind CSS assets to verify compilation and production readiness:
```bash
npm run build
```

---

## ☕ Support & Donation

If you find this project useful, you can support its development by donating via Saweria:

[![Donate via Saweria](https://img.shields.io/badge/Donate-Saweria-orange?style=for-the-badge&logo=coffee)](https://saweria.co/kodya)

Or scan the QR code below:

<p align="center">
  <img src="public/images/saweria.jpg" width="200" alt="Saweria QR Code">
</p>

---

# SummitRent by Kodya (Bahasa Indonesia)

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

## 🛠️ Instalasi & Konfigurasi

1. **Kloning & Instal Dependensi:**
   ```bash
   composer install
   npm install
   ```

2. **Konfigurasi Lingkungan (.env):**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

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

Atau scan kode QR di bawah ini:

<p align="center">
  <img src="public/images/saweria.jpg" width="200" alt="Kode QR Saweria">
</p>
