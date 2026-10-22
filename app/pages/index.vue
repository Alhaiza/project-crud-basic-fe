<script setup lang="ts">
/**
 * ==========================================================================================
 * HALAMAN: Dashboard & Katalog Produk (app/pages/index.vue)
 * ==========================================================================================
 * Alur Kerja Fitur:
 * 1. Proteksi Akses : Middleware 'auth' memeriksa keberadaan cookie token. Jika kosong -> redirect ke /login.
 * 2. Inisialisasi    : onMounted() memanggil fetchUser() (jika profil kosong) dan loadProducts().
 * 3. Read / Show     : loadProducts() memanggil GET /api/products via $api -> me-render data ke baris tabel.
 * 4. Create / Tambah : openCreateModal() set selectedProduct = null & isModalOpen = true -> ProductModal terbuka mode Tambah.
 * 5. Update / Edit   : openEditModal(item) set selectedProduct = item & isModalOpen = true -> ProductModal terbuka mode Edit.
 * 6. Delete / Hapus  : handleDeleteProduct(id) konfirmasi user -> panggil DELETE /api/products/{id} -> Toast muncul -> refresh tabel.
 * 7. Logout          : Memanggil logout() dari useAuth.ts -> token dihapus -> redirect ke /login.
 * 
 * Asal Variabel & Dependensi:
 * - definePageMeta : Compiler macro Nuxt (memasang middleware 'auth' dari app/middleware/auth.ts).
 * - $api           : Berasal dari app/plugins/api.ts (HTTP client $fetch terkonfigurasi baseURL & token Bearer).
 * - useAuth        : Berasal dari app/composables/useAuth.ts (user state, fetchUser, logout).
 * - useToast       : Berasal dari app/composables/useToast.ts (trigger feedback pop-up di kanan atas).
 * - ProductModal   : Berasal dari app/components/ProductModal.vue (komponen modal mandiri auto-import).
 * - onMounted, ref : Bawaan Vue 3 Composition API.
 * ==========================================================================================
 */

// Memasang middleware 'auth' untuk memproteksi halaman dari pengguna yang belum login
definePageMeta({
  middleware: 'auth',
})

// Mengakses instance klien API yang sudah disuntikkan secara global oleh Nuxt plugin
const { $api } = useNuxtApp()

// Mengakses data profil user, fungsi fetchUser (sinkronisasi user), dan fungsi logout
const { user, fetchUser, logout } = useAuth()

// Mengakses helper notifikasi toast global untuk menampilkan feedback sukses/gagal
const toast = useToast()

// State array reaktif untuk menampung seluruh daftar produk dari backend
const products = ref<any[]>([])

// State penanda loading saat aplikasi sedang melakukan fetch data dari API
const isLoading = ref(true)

// =========================================================================
// STATE MANAGEMENT MODAL
// =========================================================================
// isModalOpen: Saklar buka/tutup modal dialog (true = modal terbuka, false = tertutup)
const isModalOpen = ref(false)

// selectedProduct: Menampung data produk yang dipilih untuk diedit.
// Bernilai null saat mode "Tambah Produk Baru", dan bernilai objek produk saat mode "Edit".
const selectedProduct = ref<any | null>(null)

// ----------------------------------------------------------------------------------------
// ALUR FITUR: READ / SHOW DATA PRODUK
// ----------------------------------------------------------------------------------------
const loadProducts = async () => {
  isLoading.value = true
  try {
    // 1. Kirim request HTTP GET ke endpoint Laravel: /api/products (di ProductController@index)
    const res: any = await $api('/products')
    
    // 2. Format respon paginasi Laravel tersimpan di res.data.data (fallback res.data jika tanpa paginasi)
    products.value = res.data?.data || res.data || []
  } catch (error) {
    console.error('Gagal mengambil data produk:', error)
    toast.error('Gagal memuat data produk dari server.')
  } finally {
    // 3. Matikan status loading setelah proses fetch selesai
    isLoading.value = false
  }
}

// ----------------------------------------------------------------------------------------
// ALUR FITUR: MEMBUKA MODAL TAMBAH PRODUK
// ----------------------------------------------------------------------------------------
const openCreateModal = () => {
  selectedProduct.value = null // Nilai null menandakan mode Create (POST /api/products)
  isModalOpen.value = true     // Buka dialog modal
}

// ----------------------------------------------------------------------------------------
// ALUR FITUR: MEMBUKA MODAL EDIT PRODUK
// ----------------------------------------------------------------------------------------
const openEditModal = (item: any) => {
  selectedProduct.value = item // Objek produk menandakan mode Update (PUT /api/products/{id})
  isModalOpen.value = true     // Buka dialog modal
}

// Menutup modal dialog dan membersihkan produk terpilih
const closeModal = () => {
  isModalOpen.value = false
  selectedProduct.value = null
}

// ----------------------------------------------------------------------------------------
// ALUR FITUR: DELETE / HAPUS PRODUK
// ----------------------------------------------------------------------------------------
const handleDeleteProduct = async (id: number, name: string) => {
  // 1. Tampilkan konfirmasi browser native untuk mencegah penghapusan data secara tidak sengaja
  const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)
  if (!confirmDelete) return

  try {
    // 2. Kirim request HTTP DELETE ke endpoint Laravel: /api/products/{id} (ProductController@destroy)
    await $api(`/products/${id}`, { method: 'DELETE' })
    
    // 3. Tampilkan Toast feedback warna HIJAU
    toast.success(`Produk "${name}" berhasil dihapus!`)
    
    // 4. Muat ulang data produk terbaru dari server
    await loadProducts()
  } catch (error) {
    // 5. Tampilkan Toast feedback warna MERAH jika terjadi kendala pada server
    toast.error('Gagal menghapus produk dari server.')
  }
}

// ----------------------------------------------------------------------------------------
// INISIALISASI LIFECYCLE (onMounted)
// ----------------------------------------------------------------------------------------
// Lifecycle hook yang dieksekusi secara otomatis saat komponen selesai dimuat di browser
onMounted(async () => {
  // Ambil profil akun user jika state belum terisi
  if (!user.value) {
    await fetchUser()
  }
  // Ambil daftar produk awal untuk mengisi tabel
  await loadProducts()
})
</script>

<template>
  <!-- max-w-6xl (lebar maksimal kartu 1152px) | mx-auto (posisi tengah horizontal) | px-4 py-10 (padding samping dan vertikal) -->
  <div class="max-w-6xl mx-auto px-4 py-10">
    
    <!-- ================= NAVBAR / HEADER APLIKASI ================= -->
    <!-- bg-white (latar kartu putih) | rounded-2xl (sudut membulat modern) | p-6 (padding 1.5rem) | shadow-sm (bayangan halus) | border border-slate-200/80 (garis tepi lembut) | mb-8 (jarak bawah 2rem) -->
    <header class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      
      <!-- Brand & Informasi Akun Pengguna -->
      <div class="flex items-center gap-4">
        <!-- Avatar Inisial: w-12 h-12 (ukuran bulat 48px) | bg-indigo-600 (latar biru indigo) | text-white (font putih) | rounded-xl (sudut membulat) | font-bold (font tebal) -->
        <div class="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
          {{ user?.name ? user.name.charAt(0).toUpperCase() : 'P' }}
        </div>

        <div>
          <!-- text-xl font-bold (ukuran 20px tebal) | text-slate-900 (warna teks gelap pekat) -->
          <h1 class="text-xl font-bold text-slate-900">Katalog Manajemen Produk</h1>
          <!-- text-sm text-slate-500 (font 14px abu-abu redup) | mt-0.5 (jarak atas) -->
          <p class="text-sm text-slate-500 mt-0.5">
            Login sebagai:
            <!-- font-medium text-indigo-600 (font sedang warna teks biru indigo) -->
            <span class="font-medium text-indigo-600">{{ user?.name || 'Memuat profil...' }}</span>
            <!-- text-slate-400 (warna abu-abu redup) | ml-1 (jarak kiri) -->
            <span class="text-slate-400 ml-1">({{ user?.email }})</span>
          </p>
        </div>
      </div>

      <!-- Tombol Aksi Logout: @click="logout" memicu fungsi logout di useAuth.ts -->
      <!-- inline-flex items-center gap-2 (susun icon dan teks rapi) | px-4 py-2 (padding tombol) | text-sm font-medium (font 14px sedang) | text-slate-600 (teks abu-abu) | hover:text-rose-600 hover:bg-rose-50 (efek merah saat kursor hover) | rounded-xl (border radius membulat) | transition (animasi halus) -->
      <button
        @click="logout"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 hover:border-rose-200 transition duration-150 cursor-pointer"
      >
        <!-- Icon Logout SVG -->
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Keluar
      </button>
    </header>

    <!-- ================= ACTION BAR (TOTAL ITEM & TOMBOL TAMBAH) ================= -->
    <!-- flex flex-col sm:flex-row (vertikal di mobile, horizontal di tablet/desktop) | justify-between (rata kanan kiri) | items-center (tengah vertikal) | mb-6 (margin bawah 1.5rem) -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 class="text-lg font-bold text-slate-800">Daftar Produk</h2>
        <!-- text-xs text-slate-500 (font 12px abu-abu redup) -->
        <p class="text-xs text-slate-500">Total terdata: <span class="font-semibold text-slate-700">{{ products.length }} item</span></p>
      </div>

      <!-- Tombol Pemicu Modal Pop-Out: @click="openCreateModal" -->
      <!-- inline-flex items-center gap-2 (icon + teks) | bg-indigo-600 hover:bg-indigo-700 (warna dasar biru indigo dan efek hover lebih gelap) | text-white (font putih) | px-4 py-2.5 (padding tombol) | rounded-xl (sudut membulat) | shadow-sm (bayangan halus) | text-sm font-medium (font sedang 14px) -->
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-sm text-sm font-medium transition duration-150 cursor-pointer"
      >
        <!-- Icon Plus SVG -->
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Produk Baru
      </button>
    </div>

    <!-- ================= KONTEN TABEL PRODUK ================= -->
    <!-- bg-white (latar kartu putih) | rounded-2xl (sudut melengkung halus) | shadow-sm (bayangan lembut) | border border-slate-200/80 (garis tepi abu-abu lembut) | overflow-hidden (mencegah konten tabel meluber melewati border radius) -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      
      <!-- Kondisi 1: Tampilan Loading saat mengambil data dari API -->
      <div v-if="isLoading" class="p-12 text-center text-slate-400">
        <!-- animate-spin: Animasi berputar CSS bawaan Tailwind -->
        <svg class="animate-spin w-8 h-8 mx-auto text-indigo-600 mb-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <p class="text-sm">Menghubungkan ke API Laravel & mengambil data...</p>
      </div>

      <!-- Kondisi 2: Tampilan jika data produk kosong di database -->
      <div v-else-if="products.length === 0" class="p-12 text-center text-slate-500">
        <div class="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p class="text-base font-semibold text-slate-700">Belum Ada Data Produk</p>
        <p class="text-sm text-slate-400 mt-1">Data produk masih kosong. Klik tombol "Tambah Produk Baru" untuk menambahkan.</p>
      </div>

      <!-- Kondisi 3: Tabel Produk Responsif -->
      <div v-else class="overflow-x-auto">
        <!-- w-full (lebar 100%) | text-left (teks rata kiri) | border-collapse (menggabungkan border sel) -->
        <table class="w-full text-left border-collapse">
          <thead>
            <!-- bg-slate-50/80 (latar abu-abu sangat muda) | border-b border-slate-200 (garis pemisah header) | text-xs font-semibold (font 12px semi-tebal) | text-slate-500 (teks abu-abu) | uppercase tracking-wider (huruf kapital berjarak renggang) -->
            <tr class="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th class="px-6 py-4">ID</th>
              <th class="px-6 py-4">Nama Produk</th>
              <th class="px-6 py-4">Harga Satuan</th>
              <th class="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <!-- divide-y divide-slate-100: Garis batas tipis 1px antar-baris data -->
          <tbody class="divide-y divide-slate-100 text-sm">
            <!-- v-for="item in products": Looping data produk reaktif -->
            <!-- hover:bg-slate-50/80 (highlight abu-abu muda saat mouse mengarah ke baris) | transition (animasi halus) -->
            <tr v-for="item in products" :key="item.id" class="hover:bg-slate-50/80 transition duration-150">
              
              <!-- Kolom ID Produk -->
              <td class="px-6 py-4">
                <!-- font-mono (font monospace kode) | bg-slate-100 text-slate-600 (badge abu-abu) | px-2.5 py-1 (padding badge) | rounded-md (sudut membulat) -->
                <span class="font-mono text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                  #{{ item.id }}
                </span>
              </td>

              <!-- Kolom Nama Produk -->
              <td class="px-6 py-4 font-medium text-slate-900">
                {{ item.name }}
              </td>

              <!-- Kolom Harga Satuan (Format Mata Uang Rupiah) -->
              <td class="px-6 py-4">
                <!-- inline-flex (badge inline) | text-emerald-700 bg-emerald-50 (kapsul badge warna hijau lembut) | border border-emerald-200/60 (garis tepi hijau) | px-3 py-1 (padding pill) | rounded-full (bentuk kapsul bulat) | font-semibold (tebal) -->
                <span class="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                  Rp {{ Number(item.price).toLocaleString('id-ID') }}
                </span>
              </td>

              <!-- Kolom Tombol Aksi (Edit & Hapus) -->
              <td class="px-6 py-4 text-right">
                <!-- flex items-center justify-end gap-2: Menata tombol berdampingan rata kanan dengan jarak 0.5rem -->
                <div class="flex items-center justify-end gap-2">
                  
                  <!-- Tombol Edit: Memicu openEditModal(item) -->
                  <!-- inline-flex items-center gap-1.5 | text-indigo-600 bg-indigo-50 hover:bg-indigo-100 (tombol pill warna biru indigo lembut) | px-3 py-1.5 (padding tombol) | rounded-lg (border radius) | text-xs font-medium (font kecil sedang) -->
                  <button
                    @click="openEditModal(item)"
                    class="inline-flex items-center gap-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 cursor-pointer"
                  >
                    <!-- Icon Edit Pensil -->
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>

                  <!-- Tombol Hapus: Memicu handleDeleteProduct -->
                  <!-- inline-flex items-center gap-1.5 | text-rose-600 bg-rose-50 hover:bg-rose-100 (tombol pill warna merah rose lembut) | px-3 py-1.5 (padding) | rounded-lg (border radius) -->
                  <button
                    @click="handleDeleteProduct(item.id, item.name)"
                    class="inline-flex items-center gap-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 cursor-pointer"
                  >
                    <!-- Icon Sampah Hapus -->
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>

                </div>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- KOMPONEN MODAL PRODUK MANDIRI (OTOMATIS DI-IMPORT DARI components/)       -->
    <!-- Menangani Tambah (Create) dan Edit (Update) dalam satu modal tunggal       -->
    <!-- Props:                                                                    -->
    <!--   :is-open="isModalOpen"       -> Mengontrol visibilitas dialog modal      -->
    <!--   :product="selectedProduct"   -> Data produk (null jika mode Tambah Baru)  -->
    <!-- Events:                                                                   -->
    <!--   @close="closeModal"          -> Dipancarkan saat user menutup modal      -->
    <!--   @saved="loadProducts"        -> Dipancarkan saat simpan data berhasil    -->
    <!-- ========================================================================= -->
    <ProductModal
      :is-open="isModalOpen"
      :product="selectedProduct"
      @close="closeModal"
      @saved="loadProducts"
    />

  </div>
</template>
