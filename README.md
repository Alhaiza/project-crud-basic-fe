# Nuxt 4 + Laravel 11 CRUD & Authentication System

Aplikasi web modern berbasis Single Page Application (SPA) yang dibangun dengan **Nuxt 4**, **Vue 3 Composition API**, **Tailwind CSS v4**, dan **Laravel 11 REST API** dengan autentikasi **Laravel Sanctum**.

Dokumentasi ini dirancang agar mudah dipahami bagi pemula yang ingin mempelajari integrasi frontend-backend, pemanfaatan helper/composable, middleware navigasi, hingga pemodelan komponen modal dan toast.

---

## 🧭 Anatomi & Alur Bootstrapping dari Root Aplikasi

Banyak pemula bertanya: *"Apakah `app/plugins/api.ts` adalah root aplikasi?"*

Jawabannya adalah **hirarki berjenjang**:
1. **`nuxt.config.ts` (Root Konfigurasi Framework):** Berkas konfigurasi utama yang memuat runtime environment, konfigurasi Tailwind Vite, dan mendaftarkan CSS global.
2. **`app/plugins/api.ts` (Root Klien HTTP / Jantung Komunikasi API):** Dijalankan secara otomatis saat inisialisasi aplikasi Nuxt (baik di server SSR maupun browser). Plugin ini merakit instance `$fetch.create` dengan basis URL backend dan interceptor header `Authorization: Bearer <token>`, kemudian menyuntikkannya ke Nuxt Context sebagai `$api`.
3. **`app/app.vue` (Root Shell Visual / Komponen Induk Teratas):** Merupakan pembungkus visual paling luar. Menampung `<NuxtRouteAnnouncer />` (aksesibilitas), `<NuxtPage />` (merender halaman aktif), dan `<AppToast />` (menampung notifikasi melayang di kanan atas).
4. **`app/middleware/` (Pintu Gerbang Navigasi / Route Guards):** Mencegat perpindahan URL sebelum sebuah halaman dibuka.
5. **`app/composables/` (Pusat Logika & State):** Berisi fungsi helper reaktif yang dapat dipanggil di mana saja tanpa import (`useAuth`, `useToast`).
6. **`app/pages/` (Tampilan Halaman):** Berisi halaman rute berbasis berkas (`login.vue`, `register.vue`, `index.vue`).
7. **`app/components/` (Komponen UI Mandiri):** Komponen terisolasi seperti dialog pop-out (`ProductModal.vue`) dan notifikasi (`AppToast.vue`).

---

## 📂 Struktur Berkas & Direktori

```text
crud-fe/
├── app/
│   ├── app.vue                     # Root shell visual aplikasi
│   ├── assets/css/main.css         # Entry point Tailwind CSS v4 (@import 'tailwindcss')
│   ├── components/
│   │   ├── AppToast.vue            # Komponen notifikasi pop-up sudut kanan atas
│   │   └── ProductModal.vue        # Komponen modal terpadu Create (POST) & Update (PUT)
│   ├── composables/
│   │   ├── useAuth.ts              # Helper autentikasi (login, register, token, logout)
│   │   └── useToast.ts             # Helper pemicu feedback toast (success, error)
│   ├── middleware/
│   │   ├── auth.ts                 # Proteksi halaman privat (wajib login)
│   │   └── guest.ts                # Proteksi halaman publik (mencegah user login membuka login lagi)
│   ├── pages/
│   │   ├── index.vue               # Halaman utama katalog & tabel data produk
│   │   ├── login.vue               # Halaman form login akun
│   │   └── register.vue            # Halaman form pendaftaran akun baru
│   └── plugins/
│       └── api.ts                  # Plugin custom HTTP client ($api) dengan token interceptor
├── .env                            # Variabel environment URL backend
├── nuxt.config.ts                  # Konfigurasi Nuxt 4 & plugin Tailwind Vite
└── package.json                    # Dependensi npm
```

---

## 🔄 Penjelasan Alur Lengkap Tiap Fitur

### 1. Alur Registrasi Akun Baru (`register.vue`)
1. Pengguna membuka `/register` dan menginput **Nama**, **Email**, dan **Kata Sandi** (min. 8 karakter).
2. Saat tombol *Daftar Akun* diklik, `handleRegister()` memanggil method `register(form)` dari [useAuth.ts](file:///d:/Project/Project/mono-repo-crud-basic/crud-fe/app/composables/useAuth.ts).
3. `useAuth.ts` mengirimkan data ke endpoint Laravel: `POST http://localhost:8000/api/register`.
4. Laravel memvalidasi data, melakukan hashing password dengan Bcrypt, menyimpan record ke tabel `users`, dan menghasilkan Bearer token.
5. Token disimpan ke cookie browser bernama `auth_token` melalui `useCookie('auth_token')`.
6. Komposable `useToast.ts` memicu Toast **HIJAU** (*"Pendaftaran akun berhasil!"*).
7. Pengguna langsung dialihkan ke dashboard `/` secara instan via `navigateTo('/')`.

### 2. Alur Masuk Akun (`login.vue`)
1. Pengguna memasukkan email dan password di `/login`.
2. Form memanggil `login(form)` di `useAuth.ts` yang me-request ke Laravel: `POST http://localhost:8000/api/login`.
3. Jika password benar, token dari response `res.data.access_token` disimpan ke dalam cookie `auth_token`.
4. Data user disimpan ke state global `user.value`.
5. Toast **HIJAU** muncul dan navigasi beralih ke dashboard `/`.
6. Jika kredensial salah, error validasi dari Laravel ditangkap dan Toast **MERAH** dimunculkan di pojok kanan atas.

### 3. Alur Proteksi Halaman (Middleware `auth.ts` & `guest.ts`)
- **Middleware `auth.ts`:** Dipasang pada halaman privat seperti `index.vue`. Jika cookie `auth_token` kosong (`isAuthenticated == false`), pengguna langsung dicegat dan dialihkan paksa ke `/login`.
- **Middleware `guest.ts`:** Dipasang pada halaman `login.vue` dan `register.vue`. Jika pengguna sudah memiliki token aktif, mereka tidak diperkenankan melihat form login lagi dan otomatis dialihkan ke `/`.

### 4. Alur Menampilkan Data Produk (`index.vue` - Read / Show)
1. Saat halaman `/` selesai dimuat (`onMounted`), fungsi `loadProducts()` dijalankan.
2. Memanggil klien HTTP `$api('/products')` (GET). Plugin [api.ts](file:///d:/Project/Project/mono-repo-crud-basic/crud-fe/app/plugins/api.ts) secara otomatis menyematkan header `Authorization: Bearer <token>` dari cookie.
3. Respon JSON Laravel yang telah terpaginasi diekstrak (`res.data.data`) dan disimpan ke dalam array reaktif `products.value`.
4. Template tabel me-render daftar produk lengkap dengan badge nomor ID, nama produk, dan harga berformat Rupiah.

### 5. Alur Tambah & Edit Produk Terpadu (`ProductModal.vue` - Create & Update)
Daripada membuat dua modal berbeda, sistem ini menyatukan Create dan Update dalam satu modal pop-out:
1. **Mode Tambah:** Tombol *+ Tambah Produk Baru* menetapkan `selectedProduct = null` dan membuka modal (`isModalOpen = true`). Modal menampilkan judul *"Tambah Produk Baru"* dengan form kosong. Saat disimpan, dieksekusi `POST /api/products`.
2. **Mode Edit:** Tombol *Edit* pada baris produk menetapkan `selectedProduct = item`. Watcher pada modal mendeteksi keberadaan objek produk, mengisi form secara otomatis, dan mengubah judul menjadi *"Edit Informasi Produk"*. Saat disimpan, dieksekusi `PUT /api/products/{id}`.
3. **Teleportasi Modal:** Modal dibungkus tag `<Teleport to="body">`, memastikan posisinya selalu melayang di atas seluruh elemen DOM (persis modal-backdrop Bootstrap).
4. Setelah simpan sukses, modal memancarkan event `@saved` ke `index.vue` untuk menyegarkan isi tabel, dan Toast **HIJAU** muncul memberi konfirmasi.

### 6. Alur Format Titik Ribuan Otomatis (Contoh: `10000` -> `10.000`)
Untuk kenyamanan visual pengguna tanpa merusak validasi database:
1. Input menggunakan `type="text"` dan `inputmode="numeric"`.
2. Saat diketik, fungsi `handlePriceInput` menyaring semua karakter non-angka via regex `replace(/[^0-9]/g, '')`.
3. Tampilan input (`displayPrice`) diformat dengan titik ribuan via `Number(...).toLocaleString('id-ID')` sehingga tampil cantik sebagai `10.000` dengan awalan `Rp`.
4. Namun variabel data (`form.price`) tetap disimpan sebagai **angka integer murni** (`10000`). Dengan demikian, backend Laravel menerima angka numerik murni tanpa error validasi format.

### 7. Alur Hapus Produk (`index.vue` - Delete)
1. Pengguna menekan tombol *Hapus* pada baris produk.
2. Dialog konfirmasi bawaan browser muncul (`confirm()`).
3. Jika disetujui, dipanggil `$api('/products/' + id, { method: 'DELETE' })`.
4. Record produk dihapus di backend, tabel di-refresh, dan Toast **HIJAU** muncul bertuliskan *"Produk ... berhasil dihapus!"*.

### 8. Alur Logout Sesi (`useAuth.ts` - Logout)
1. Pengguna menekan tombol *Keluar* pada navbar.
2. Memanggil endpoint Laravel `POST /api/logout` untuk memusnahkan token di database.
3. Nilai cookie `auth_token` di browser dikosongkan (`null`) dan state user direset.
4. Pengguna diarahkan kembali ke `/login`.

---

## 🚀 Panduan Menjalankan Proyek Secara Terpadu

### 1. Menjalankan Backend (`crud-be`):
```bash
cd crud-be
composer install
php artisan migrate
php artisan serve
```
Backend berjalan pada: `http://localhost:8000`.

### 2. Menjalankan Frontend (`crud-fe`):
```bash
cd crud-fe
npm install
npm run dev
```
Frontend berjalan pada: `http://localhost:3000`.
Pastikan file `.env` di `crud-fe` memiliki konfigurasi:
```env
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
```

---

## 💡 Konsep Penting untuk Pemula (Cheat Sheet)

- **Mengapa `$api` bukan `axios`?** Nuxt 4 memiliki engine bawaan `ofetch` yang lebih cepat, ringan, otomatis mem-parsing JSON, dan mendukung Server-Side Rendering tanpa konfigurasi rumit.
- **Mengapa `<Teleport to="body">`?** Memindahkan elemen HTML modal langsung ke bawah tag `<body>` agar bebas dari masalah z-index atau overflow terpotong oleh elemen induk.
- **Mengapa `useState` bukan variabel biasa?** `useState` menjamin data reaktif tidak mengalami *state leak* antar-pengguna yang mengakses server secara bersamaan saat SSR.
