<script setup lang="ts">
// 1. Menerapkan middleware rute 'auth': memastikan hanya pengguna terautentikasi yang bisa mengakses halaman ini
definePageMeta({
  middleware: 'auth',
})

// 2. Mengakses instance $api kustom yang sudah diinjeksi oleh Nuxt plugin
const { $api } = useNuxtApp()

// 3. Mengakses data profil user, fungsi fetchUser, dan logout dari composable useAuth
const { user, fetchUser, logout } = useAuth()

// 4. Mengakses helper notifikasi toast global untuk menampilkan respon di kanan atas layar
const toast = useToast()

// 5. State reaktif untuk menyimpan daftar produk dari backend
const products = ref<any[]>([])

// 6. State penanda loading saat aplikasi sedang melakukan fetch data dari API
const isLoading = ref(true)

// =========================================================================
// STATE MANAGEMENT MODAL
// =========================================================================
// isModalOpen: Saklar buka/tutup modal (true = muncul pop-out, false = tertutup)
const isModalOpen = ref(false)

// selectedProduct: Menyimpan data produk yang sedang diedit (null jika sedang mode tambah baru)
const selectedProduct = ref<any | null>(null)

// 7. Fungsi mengambil data produk dari endpoint GET /api/products
const loadProducts = async () => {
  isLoading.value = true
  try {
    const res: any = await $api('/products')
    // Laravel paginate mengembalikan array data di res.data.data (fallback res.data)
    products.value = res.data?.data || res.data || []
  } catch (error) {
    console.error('Gagal mengambil data produk:', error)
    toast.error('Gagal memuat data produk dari server.')
  } finally {
    isLoading.value = false
  }
}

// 8. Fungsi membuka modal untuk mode "Tambah Produk Baru"
const openCreateModal = () => {
  selectedProduct.value = null // null menandakan mode Create (POST)
  isModalOpen.value = true     // Membuka modal
}

// 9. Fungsi membuka modal untuk mode "Edit Produk"
const openEditModal = (item: any) => {
  selectedProduct.value = item // Berisi data produk menandakan mode Update (PUT)
  isModalOpen.value = true     // Membuka modal
}

// 10. Fungsi menutup modal
const closeModal = () => {
  isModalOpen.value = false
  selectedProduct.value = null
}

// 11. Fungsi menghapus produk via endpoint DELETE /api/products/{id}
const handleDeleteProduct = async (id: number, name: string) => {
  const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)
  if (!confirmDelete) return

  try {
    await $api(`/products/${id}`, { method: 'DELETE' })
    toast.success(`Produk "${name}" berhasil dihapus!`)
    // Muat ulang data setelah dihapus
    await loadProducts()
  } catch (error) {
    toast.error('Gagal menghapus produk dari server.')
  }
}

// 12. Lifecycle hook onMounted: dieksekusi saat halaman pertama kali dibuka di browser
onMounted(async () => {
  if (!user.value) {
    await fetchUser()
  }
  await loadProducts()
})
</script>

<template>
  <!-- max-w-6xl (lebar maksimal 1152px), mx-auto (posisi tengah horizontal), px-4 (padding samping 1rem), py-10 (padding vertikal 2.5rem) -->
  <div class="max-w-6xl mx-auto px-4 py-10">
    
    <!-- ================= NAVBAR / HEADER APLIKASI ================= -->
    <!-- bg-white (latar kartu putih), rounded-2xl (sudut lengkung modern), p-6 (padding 1.5rem), shadow-sm (bayangan halus), border (garis tepi lembut), mb-8 (jarak bawah 2rem) -->
    <header class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      
      <!-- Brand & Informasi Akun Pengguna -->
      <div class="flex items-center gap-4">
        <!-- Avatar Inisial: w-12 h-12 (ukuran bulat 48px), bg-indigo-600 (warna biru indigo), text-white (font putih), rounded-xl (sudut lengkung), font-bold (tebal) -->
        <div class="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
          {{ user?.name ? user.name.charAt(0).toUpperCase() : 'P' }}
        </div>

        <div>
          <!-- text-xl (font 20px), font-bold (tebal), text-slate-900 (warna gelap) -->
          <h1 class="text-xl font-bold text-slate-900">Katalog Manajemen Produk</h1>
          <!-- text-sm (font 14px), text-slate-500 (warna teks abu-abu redup), mt-0.5 (jarak atas) -->
          <p class="text-sm text-slate-500 mt-0.5">
            Login sebagai:
            <!-- font-medium (font sedang), text-indigo-600 (warna teks indigo) -->
            <span class="font-medium text-indigo-600">{{ user?.name || 'Memuat profil...' }}</span>
            <!-- text-slate-400 (warna abu-abu redup), ml-1 (jarak kiri) -->
            <span class="text-slate-400 ml-1">({{ user?.email }})</span>
          </p>
        </div>
      </div>

      <!-- Tombol Aksi Header: Logout -->
      <!-- inline-flex (flexbox inline), items-center (tengah), gap-2 (jarak icon dan teks), px-4 py-2 (padding), text-sm (font 14px), text-slate-600 (teks abu-abu), hover:text-rose-600 (teks merah saat hover), hover:bg-rose-50 (latar merah muda saat hover), rounded-xl (border radius), transition (animasi halus) -->
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
    <!-- flex (display flexbox), justify-between (rata kanan kiri), items-center (tengah vertikal), mb-6 (margin bawah 1.5rem) -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 class="text-lg font-bold text-slate-800">Daftar Produk</h2>
        <!-- text-xs (font 12px), text-slate-500 (warna abu-abu) -->
        <p class="text-xs text-slate-500">Total terdata: <span class="font-semibold text-slate-700">{{ products.length }} item</span></p>
      </div>

      <!-- Tombol Pemicu Modal Pop-Out: @click="openCreateModal" -->
      <!-- inline-flex items-center gap-2 (susun icon dan teks dengan jarak), bg-indigo-600 hover:bg-indigo-700 (warna biru indigo utama), text-white (font putih), px-4 py-2.5 (padding tombol), rounded-xl (sudut lengkung), shadow-sm (bayangan lembut), text-sm font-medium (font sedang 14px), transition (transisi warna halus) -->
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
    <!-- bg-white (latar putih), rounded-2xl (sudut melengkung halus), shadow-sm (bayangan lembut), border border-slate-200/80 (garis tepi abu-abu lembut), overflow-hidden (mencegah konten tabel meluber melewati border radius) -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      
      <!-- Kondisi 1: Tampilan Loading saat mengambil data -->
      <!-- p-12 (padding besar 3rem), text-center (posisi tengah), text-slate-400 (warna teks redup) -->
      <div v-if="isLoading" class="p-12 text-center text-slate-400">
        <!-- animate-spin (animasi berputar terus-menerus), w-8 h-8 (ukuran icon 32px), mx-auto (posisi tengah) -->
        <svg class="animate-spin w-8 h-8 mx-auto text-indigo-600 mb-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <p class="text-sm">Menghubungkan ke API Laravel & mengambil data...</p>
      </div>

      <!-- Kondisi 2: Tampilan jika data produk kosong -->
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
        <!-- w-full (lebar 100%), text-left (teks rata kiri) -->
        <table class="w-full text-left border-collapse">
          <thead>
            <!-- bg-slate-50/80 (latar abu-abu sangat muda), border-b border-slate-200 (garis pemisah header), text-xs (font 12px), font-semibold (semi-tebal), text-slate-500 (warna teks redup), uppercase (huruf kapital), tracking-wider (jarak antar-huruf) -->
            <tr class="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th class="px-6 py-4">ID</th>
              <th class="px-6 py-4">Nama Produk</th>
              <th class="px-6 py-4">Harga Satuan</th>
              <th class="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <!-- divide-y divide-slate-100: memberi garis batas lembut 1px di setiap baris data -->
          <tbody class="divide-y divide-slate-100 text-sm">
            <!-- Looping data produk: hover:bg-slate-50/80 (efek highlight saat baris disorot mouse), transition (animasi halus) -->
            <tr v-for="item in products" :key="item.id" class="hover:bg-slate-50/80 transition duration-150">
              
              <!-- Kolom ID -->
              <td class="px-6 py-4">
                <!-- font-mono (font monospace kode), bg-slate-100 (latar abu-abu), text-slate-600 (teks abu-abu), px-2.5 py-1 (padding badge), rounded-md (sudut badge) -->
                <span class="font-mono text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                  #{{ item.id }}
                </span>
              </td>

              <!-- Kolom Nama Produk -->
              <td class="px-6 py-4 font-medium text-slate-900">
                {{ item.name }}
              </td>

              <!-- Kolom Harga Produk (Format Rupiah) -->
              <td class="px-6 py-4">
                <!-- inline-flex (posisi badge), font-semibold (font tebal), text-emerald-700 (teks hijau gelap), bg-emerald-50 (latar hijau muda), px-3 py-1 (padding pill badge), rounded-full (bentuk kapsul bulat) -->
                <span class="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                  Rp {{ Number(item.price).toLocaleString('id-ID') }}
                </span>
              </td>

              <!-- Kolom Tombol Aksi (Edit & Hapus) -->
              <!-- text-right (rata kanan) -->
              <td class="px-6 py-4 text-right">
                <!-- flex items-center justify-end gap-2: menata kedua tombol berdampingan rapi dengan jarak 0.5rem -->
                <div class="flex items-center justify-end gap-2">
                  
                  <!-- Tombol Edit: Memicu openEditModal(item) -->
                  <!-- inline-flex items-center gap-1.5 (susun icon dan teks), text-indigo-600 (teks biru indigo), bg-indigo-50 (latar biru muda), hover:bg-indigo-100 (latar lebih gelap saat hover), px-3 py-1.5 (padding tombol), rounded-lg (sudut lengkung), text-xs font-medium (font kecil sedang) -->
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
                  <!-- text-rose-600 (teks merah), bg-rose-50 (latar merah muda), hover:bg-rose-100 (hover lebih pekat), px-3 py-1.5 (padding), rounded-lg (border radius), text-xs font-medium (font kecil sedang) -->
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
    <!-- ========================================================================= -->
    <ProductModal
      :is-open="isModalOpen"
      :product="selectedProduct"
      @close="closeModal"
      @saved="loadProducts"
    />

  </div>
</template>
