# Product Requirement Document (PRD) — SummitRent

## 1. Lingkup Produk (Product Scope)
**SummitRent** adalah Single Page Application (SPA) berbasis web yang mengintegrasikan panel pengelolaan administrasi kasir outdoor, POS transaksi penyewaan climbing/hiking gear, pelacakan data pelanggan, manajemen gudang inventaris produk, notifikasi real-time via WebSocket, dan asisten pemecahan kendala AI.

---

## 2. Kebutuhan Fungsional (Functional Requirements)

### A. Subsystem Akun & Keamanan (Accounts & Security)
- **CRUD Pengguna:** Admin/Owner dapat membuat, membaca, memperbarui, dan menghapus akun staf (Owner & Kasir).
- **Pembagian Peran & Izin Spatie (Granular Authorization):**
  - **Owner**: Memiliki kontrol penuh atas analytics, pengelolaan staf, keuangan, dan manipulasi inventaris produk.
  - **Kasir**: Memiliki akses terbatas untuk operasi transaksi harian (Pelanggan & Sewa) serta membaca daftar produk.
- **Unggah Avatar & Micah Builder:**
  - Pengguna dapat mengunggah file foto asli (jpg/png) berukuran maksimal `2MB`.
  - Pilihan alternatif: **API DiceBear 9.x Micah Vektor Builder** untuk generate avatar dinamis secara real-time berbasis nama pengguna. Menyediakan kustomisasi ekspresi mulut, warna kaos, dan backdrop preset linear-gradient serta pemilih warna kustom (*color picker*).
- **Deferred Skeleton Table:** Pemuatan halaman Akun secara asinkron menggunakan deferred props dari Inertia v3, merender mockup *Skeleton Table* berdenyut dengan padding, tinggi, dan kolom yang presisi mencerminkan struktur asli.

### B. POS Transaksi Kasir (Point of Sale Subsystem)
- **POS Catalog Grid:** Menampilkan daftar peralatan outdoor yang berstatus `Available` dengan visual kartu produk yang dilengkapi gambar produk, harga sewa per hari, dan sisa stok.
- **Kasir Checkout Cart:**
  - Tambah, hapus, dan perbarui kuantitas sewa produk.
  - Popover Date Pickers premium (Shadcn Calendar) terintegrasi zona waktu imun memanfaatkan package `@internationalized/date` untuk durasi awal dan batas sewa.
  - Shortcut tombol tambah pelanggan baru langsung di keranjang tanpa meninggalkan alur transaksi.
  - **Alur Pembayaran Terintegrasi:** Pilihan diskon nominal (Rp) ribuan terformat separator, pilihan tipe pembayaran (*Cash* atau *QRIS*), input uang tunai diterima, dan kalkulator uang kembalian atau sisa tagihan/defisit (berwarna merah tebal jika minus).
  - Validasi ketat mencegah checkout jika uang pembayaran tunai kurang dari Grand Total sewa.

### C. Manajemen Data Pelanggan (Customer Directory)
- **Form Registrasi & Edit:** Menerima nama, email, telepon, NIK, dan alamat.
- **NIK & Telepon Restriction:** Panjang KTP/NIK dibatasi tepat 16 digit angka, nomor telepon dibatasi panjang 10-15 digit berkarakter khusus `+` dan angka saja.
- **Real-Time Availability Validation:** Melakukan pengecekan duplikasi NIK dan Email ke database secara asinkron setiap `500ms` saat pengguna mengetik, menampilkan spinner loader `Loader2` dan ikon centang hijau `Check` saat tersedia.
- **Cover Photo Identity Overlay ("Preview Photo Timpa"):** Upload foto KTP dengan wadah berukuran penuh (`h-48 w-full`) responsif, drag-and-drop, dan overlay hover gelap interaktif untuk mengubah (*change*) atau menghapus (*remove*) preview foto.
- **Administrasi Wilayah Resmi (Wilayah Indonesia):** Cascading dropdown pencarian wilayah resmi dari tingkat Provinsi, Kabupaten/Kota, Kecamatan, hingga Desa/Kelurahan memanfaatkan database kode wilayah resmi yang efisien.

### D. Asisten AI & Obrolan Real-Time (AI Assistant Chatbot)
- **Split-Pane Chat Dialog:** Tampilan obrolan 2-kolom premium:
  - **Kiri (1/3)**: Daftar sesi riwayat chat yang tersimpan secara persisten pada `localStorage` pengguna.
  - **Kanan (2/3)**: Tampilan ruang pesan obrolan interaktif yang ramah markdown.
- **Live Assistant Thinking Process:** Menampilkan bar kemajuan dan langkah-langkah berpikir asisten AI secara real-time ("Proses Berpikir Asisten") yang disiarkan via WebSocket channel pribadi Reverb sebelum teks respon dialirkan.

### E. Notifikasi Operasional Real-Time
- **Header Notification Bell:** Lonceng notifikasi interaktif di bar atas yang menampilkan lencana jumlah unread, reactive WebSocket updates, dan riwayat notifikasi untuk:
  - Peringatan stok produk menipis (*low-stock*).
  - Status sewa terbarui (disewa, dikembalikan, dibatalkan).
  - Peringatan harian transaksi terlambat (*overdue*).

---

## 3. Desain & Kebutuhan UI/UX (Non-Functional Design Requirements)

### A. Harmonious Dark/Light Themes & Transitions
- **Circular Reveal (Ripple) Transitions:** Perpindahan tema (Terang/Gelap/Sistem) melakukan efek ripple lingkaran membesar berpusat pada kursor mouse menggunakan **View Transitions API** (`document.startViewTransition`) secara instan.
- **Anti Theme Flash (Glitch-Free FOUC):** Integrasi pemilih tema inline di head HTML memastikan dark mode di-render seketika tanpa ada kedipan warna putih saat me-refresh halaman.
- **Custom Scrollbars:** Batasan scroll pada kontainer memiliki visual scrollbar abu-abu transparan premium yang beradaptasi otomatis terhadap perubahan warna tema.

### B. Otorisasi Rute Backend & Keamanan (API Security)
- **Granular Spatie Permission Guarding:** Seluruh endpoint RESTful di `routes/web.php` harus dilindungi oleh middleware `permission:name` yang cocok secara presisi (contoh: `Route::delete('/customers/{customer}', ...)->middleware('permission:customers.delete')`), menggantikan pengelompokan role kasar untuk mencegah penembakan API ilegal.

---

## 4. Persyaratan Kinerja (Performance Requirements)
- **Kecepatan Respons Latar Belakang (Deferred Data):** Query tabel database berat (Akun & Produk) harus dimuat secara asinkron di belakang layar menggunakan deferred props, menjaga pemuatan halaman awal instan kurang dari `300ms`.
- **Debounced Search Inputs:** Input pencarian di tabel Akun, Produk, dan Pelanggan harus didebounce selama `400ms` - `500ms` sebelum memicu *request* Inertia baru untuk menekan overhead beban server database.
- **FrankenPHP & Octane Caching:** Kecepatan akses supersonic dicapai dengan caching konfigurasi, rute, dan view di tingkat produksi, serta isolasi worker memori Octane yang aman dari kebocoran memori.
