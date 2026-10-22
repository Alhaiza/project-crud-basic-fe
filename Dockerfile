# ==============================================================================
# DOCKERFILE FRONTEND NUXT 4 (MULTI-STAGE PRODUCTION BUILD)
# ==============================================================================
# INI APA: Cetak biru perakitan kontainer aplikasi frontend Nuxt 4 berbasis Vue 3.
# KENAPA: Menggunakan teknik Multi-Stage Build untuk memisahkan tahap kompilasi bundler Vite
#         yang berat dengan tahap runtime produksi server Nitro yang sangat ringan.
# UNTUK APA & BAGAIMANA:
#   - Stage 1 mengompilasi SFC Vue (.vue), Tailwind CSS, dan TypeScript ke biner JavaScript murni.
#   - Stage 2 hanya mengambil folder artefak build '.output' dan menjalankannya dengan Node Alpine.
#   - Hasilnya: Penggunaan RAM kontainer frontend di server hanya ~27 MiB (sangat hemat biaya VPS).
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: COMPILATION & BUNDLING NUXT 4 FRONTEND
# ------------------------------------------------------------------------------
# INI APA: Tahap pembangunan sementara menggunakan Node.js 22 LTS berbasis Alpine Linux.
# KENAPA: Dibutuhkan Node runtime penuh dan manajer paket npm untuk menyelesaikan build Vite/Nitro.
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# INI APA: Menyalin manifest package.json dan package-lock.json.
# KENAPA: Mengoptimalkan Docker Layer Cache. Jika tidak ada pustaka npm baru yang dipasang,
#         Docker akan menggunakan cache layer dan melompati proses download 'npm ci'.
COPY package*.json ./

# INI APA: Instalasi paket dependensi secara deterministik dan bersih.
# KENAPA: 'npm ci' (Clean Install) membaca exact versi dari 'package-lock.json',
#         menjamin build 100% identik di setiap mesin server tanpa modifikasi semver.
RUN npm ci

# INI APA: Menyalin seluruh kode sumber Nuxt (pages, components, stores, assets).
# BAGAIMANA: Direktori seperti 'node_modules', '.nuxt', '.output' diabaikan via '.dockerignore'.
COPY . .

# INI APA: Konfigurasi variabel build-time untuk endpoint API Backend.
# KENAPA: Nuxt 4 membutuhkan konfigurasi 'runtimeConfig.public.apiBase' saat SSR dan peramban klien.
# BAGAIMANA: Menetapkan default relative path '/api', sehingga browser memanggil API lewat gateway
#           Nginx pada host dan port yang sama (menghilangkan error CORS).
ARG NUXT_PUBLIC_API_BASE=/api
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}
ENV NODE_ENV=production

# INI APA: Eksekusi kompilasi kode Nuxt menjadi bundel server Nitro standalone.
# BAGAIMANA: Menghasilkan folder '.output/' yang berisi server HTTP mandiri berbasis Node.js.
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: PRODUCTION RUNTIME (STANDALONE NITRO ENGINE)
# ------------------------------------------------------------------------------
# INI APA: Image final yang berjalan di lingkungan server / produksi.
# KENAPA: Seluruh folder 'node_modules' raksasa (~500 MB) dan tool kompilasi Vite DIBUANG TOTAL.
#         Hanya runtime Node.js minimalis dan folder build '.output' (~40 MB) yang disimpan.
# UNTUK APA & BAGAIMANA: Melayani permintaan halaman web, SSR, dan file statis JS/CSS ke Nginx.
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# INI APA: Konfigurasi environment produksi runtime.
# BAGAIMANA:
#   - 'NODE_ENV=production': Mengaktifkan mode performa tinggi internal runtime V8.
#   - 'HOST=0.0.0.0': Mengikat server Nitro ke seluruh network interface agar dapat diakses Nginx.
#   - 'PORT=3000': Menetapkan port listening internal service frontend.
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# INI APA: Menyalin HANYA hasil build terkompilasi dari builder stage.
# KENAPA: Menjaga ukuran image sekecil mungkin dan meminimalkan celah keamanan (vulnerability surface).
COPY --from=builder /app/.output ./.output

# INI APA: Dokumentasi port internal service frontend.
EXPOSE 3000

# INI APA: Perintah eksekusi server mandiri Nitro saat kontainer hidup.
# BAGAIMANA: Menjalankan skrip JavaScript ESM murni '.output/server/index.mjs' tanpa bantuan nuxt CLI.
CMD ["node", ".output/server/index.mjs"]
