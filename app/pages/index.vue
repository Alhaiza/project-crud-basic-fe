<script setup lang="ts">
// 1. Menerapkan middleware rute 'auth': memastikan hanya pengguna terautentikasi yang bisa membuka halaman ini
definePageMeta({
  middleware: 'auth',
})

// 2. Mengakses helper $api dari Nuxt context untuk pemanggilan REST API Laravel
const { $api } = useNuxtApp()

// 3. Mengakses state user, fungsi fetchUser, dan logout dari composable useAuth
const { user, fetchUser, logout } = useAuth()

// 4. State untuk menyimpan array daftar produk dari backend
const products = ref<any[]>([])

// 5. State penanda loading data saat mengambil produk dari server
const isLoading = ref(true)

// 6. State untuk mengontrol visibilitas modal dialog tambah/edit produk
const isModalOpen = ref(false)

// 7. State penanda apakah modal sedang dalam mode edit (true) atau mode tambah (false)
const isEditing = ref(false)

// 8. Menyimpan ID produk yang sedang diedit
const editingId = ref<number | null>(null)

// 9. State form reaktif untuk input nama dan harga produk
const form = reactive({
  name: '',
  price: 0,
})

// 10. State penanda loading saat tombol simpan di modal ditekan
const isSaving = ref(false)

// 11. State untuk menampung pesan error dari form modal jika validasi gagal
const modalError = ref('')

// 12. Fungsi mengambil data produk dari endpoint GET /api/products Laravel
const loadProducts = async () => {
  isLoading.value = true
  try {
    const res: any = await $api('/products')
    // Laravel paginate mengembalikan array data di res.data.data
    products.value = res.data?.data || res.data || []
  } catch (error) {
    console.error('Gagal memuat produk:', error)
  } finally {
    isLoading.value = false
  }
}

// 13. Fungsi membuka modal untuk mode tambah produk baru
const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.name = ''
  form.price = 0
  modalError.value = ''
  isModalOpen.value = true
}

// 14. Fungsi membuka modal untuk mode edit produk yang sudah ada
const openEditModal = (item: any) => {
  isEditing.value = true
  editingId.value = item.id
  form.name = item.name
  form.price = Number(item.price)
  modalError.value = ''
  isModalOpen.value = true
}

// 15. Fungsi menutup modal form
const closeModal = () => {
  isModalOpen.value = false
}

// 16. Fungsi submit simpan data (POST untuk create, PUT untuk update)
const handleSaveProduct = async () => {
  modalError.value = ''
  isSaving.value = true

  try {
    if (isEditing.value && editingId.value) {
      // Endpoint PUT /api/products/{id} untuk memperbarui data
      await $api(`/products/${editingId.value}`, {
        method: 'PUT',
        body: form,
      })
    } else {
      // Endpoint POST /api/products untuk membuat produk baru
      await $api('/products', {
        method: 'POST',
        body: form,
      })
    }

    // Tutup modal dan refresh daftar produk terbaru
    closeModal()
    await loadProducts()
  } catch (err: any) {
    modalError.value = err?.data?.message || 'Gagal menyimpan data produk.'
  } finally {
    isSaving.value = false
  }
}

// 17. Fungsi menghapus produk melalui endpoint DELETE /api/products/{id}
const handleDeleteProduct = async (id: number, name: string) => {
  const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)
  if (!confirmDelete) return

  try {
    await $api(`/products/${id}`, { method: 'DELETE' })
    // Muat ulang daftar produk setelah berhasil dihapus
    await loadProducts()
  } catch (error) {
    alert('Gagal menghapus produk.')
  }
}

// 18. Lifecycle hook onMounted: dieksekusi saat komponen ter-render di browser
onMounted(async () => {
  // Ambil data profil user jika state user masih kosong
  if (!user.value) {
    await fetchUser()
  }
  // Ambil daftar produk awal
  await loadProducts()
})
</script>

<template>
  <!-- max-w-6xl (lebar maks 1152px), mx-auto (posisi tengah horizontal), px-4 (padding samping), py-8 (padding vertikal) -->
  <div class="max-w-6xl mx-auto px-4 py-8">
    
    <!-- Header Aplikasi: Judul, Info User, dan Tombol Keluar -->
    <!-- flex (display flexbox), justify-between (jarak kiri-kanan rata), items-center (vertikal tengah), pb-6 (padding bawah), border-b (garis bawah batas) -->
    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 gap-4 mb-8">
      <div>
        <!-- text-2xl (font 24px), font-bold (tebal), text-gray-900 (warna teks gelap) -->
        <h1 class="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
        <!-- text-sm (font 14px), text-gray-500 (warna teks abu-abu redup), mt-1 (jarak atas) -->
        <p class="text-sm text-gray-500 mt-1">
          Masuk sebagai:
          <!-- font-semibold (font semi-tebal), text-blue-600 (warna biru) -->
          <span class="font-semibold text-blue-600">{{ user?.name || 'Memuat profil...' }}</span>
          <!-- text-gray-400 (warna abu-abu redup), ml-1 (jarak kiri) -->
          <span class="text-gray-400 ml-1">({{ user?.email }})</span>
        </p>
      </div>

      <!-- Tombol Aksi Header: Tambah Produk & Logout -->
      <!-- flex items-center gap-3: menyusun tombol berdampingan dengan jarak 0.75rem -->
      <div class="flex items-center gap-3">
        <!-- Tombol Tambah Produk: bg-blue-600 (biru), hover:bg-blue-700 (biru tua saat hover), text-white (teks putih), px-4 py-2 (padding), rounded-lg (sudut tumpul), text-sm (font 14px), font-medium (font sedang) -->
        <button
          @click="openCreateModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 shadow-sm cursor-pointer"
        >
          + Tambah Produk
        </button>

        <!-- Tombol Logout: bg-gray-100 (latar abu-abu terang), hover:bg-red-50 hover:text-red-600 (merah saat hover), text-gray-700 (warna teks abu-abu gelap), px-4 py-2 (padding), rounded-lg (border radius) -->
        <button
          @click="logout"
          class="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition duration-200 cursor-pointer"
        >
          Keluar
        </button>
      </div>
    </header>

    <!-- Konten Tabel Produk -->
    <!-- bg-white (latar putih), rounded-xl (sudut tumpul), shadow-sm (bayangan halus), border (garis border tepi), overflow-hidden (potong sudut meluap) -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      <!-- Tampilan Loading saat data sedang di-fetch -->
      <div v-if="isLoading" class="p-12 text-center text-gray-500">
        <p class="text-sm animate-pulse">Sedang mengambil data produk dari API...</p>
      </div>

      <!-- Tampilan Kosong jika tidak ada produk -->
      <div v-else-if="products.length === 0" class="p-12 text-center text-gray-500">
        <p class="text-base font-medium text-gray-700">Belum ada produk yang ditambahkan</p>
        <p class="text-sm text-gray-400 mt-1">Klik tombol "+ Tambah Produk" di atas untuk menambahkan data baru.</p>
      </div>

      <!-- Tabel Daftar Produk Responsif -->
      <div v-else class="overflow-x-auto">
        <!-- w-full (lebar 100%), text-left (rata kiri), border-collapse (gabungkan border) -->
        <table class="w-full text-left border-collapse">
          <thead>
            <!-- bg-gray-50 (latar abu-abu terang header tabel), text-xs (font 12px), text-gray-500 (warna teks abu-abu), uppercase (huruf kapital), border-b (garis pemisah) -->
            <tr class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
              <th class="px-6 py-3.5">ID</th>
              <th class="px-6 py-3.5">Nama Produk</th>
              <th class="px-6 py-3.5">Harga</th>
              <th class="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <!-- divide-y divide-gray-100: memberi garis pemisah tipis antar-baris data -->
          <tbody class="divide-y divide-gray-100 text-sm text-gray-800">
            <!-- Looping data produk: hover:bg-gray-50 (efek hover baris tabel) -->
            <tr v-for="item in products" :key="item.id" class="hover:bg-gray-50 transition">
              <!-- px-6 py-4: padding dalam sel tabel -->
              <td class="px-6 py-4 font-mono text-xs text-gray-400">#{{ item.id }}</td>
              <td class="px-6 py-4 font-medium text-gray-900">{{ item.name }}</td>
              <td class="px-6 py-4 text-emerald-600 font-semibold">
                Rp {{ Number(item.price).toLocaleString('id-ID') }}
              </td>
              <!-- text-right (rata kanan untuk tombol aksi) -->
              <td class="px-6 py-4 text-right space-x-2">
                <!-- Tombol Edit: text-blue-600 (biru), hover:underline (garis bawah saat hover) -->
                <button
                  @click="openEditModal(item)"
                  class="text-blue-600 hover:text-blue-800 font-medium text-xs px-2.5 py-1.5 bg-blue-50 rounded hover:bg-blue-100 transition cursor-pointer"
                >
                  Edit
                </button>
                <!-- Tombol Hapus: text-red-600 (merah), hover:bg-red-100 (hover merah muda) -->
                <button
                  @click="handleDeleteProduct(item.id, item.name)"
                  class="text-red-600 hover:text-red-800 font-medium text-xs px-2.5 py-1.5 bg-red-50 rounded hover:bg-red-100 transition cursor-pointer"
                >
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <!-- Modal Dialog Tambah / Edit Produk -->
    <!-- fixed inset-0 (posisi overlay layar penuh), bg-black/50 (latar belakang gelap transparan), flex items-center justify-center (tengah), z-50 (lapisan teratas) -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center px-4 z-50">
      <!-- Modal Box: bg-white (latar putih), rounded-2xl (sudut tumpul), max-w-md (lebar maks 448px), w-full (lebar 100%), p-6 (padding), shadow-2xl (bayangan tebal) -->
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        
        <!-- Header Modal -->
        <div class="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-900">
            {{ isEditing ? 'Edit Data Produk' : 'Tambah Produk Baru' }}
          </h2>
          <!-- Tombol silang tutup modal -->
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">&times;</button>
        </div>

        <!-- Notifikasi error di modal jika validasi input gagal -->
        <div v-if="modalError" class="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs">
          {{ modalError }}
        </div>

        <!-- Form Input Modal: @submit.prevent mencegah reload -->
        <form @submit.prevent="handleSaveProduct" class="space-y-4">
          <!-- Field Nama Produk -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Nama Produk</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Contoh: Kopi Robusta"
              class="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <!-- Field Harga Produk -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Harga (IDR)</label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              required
              placeholder="Contoh: 25000"
              class="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <!-- Aksi Tombol Modal: Batal & Simpan -->
          <div class="flex justify-end gap-2.5 pt-3 border-t border-gray-100 mt-6">
            <!-- Tombol Batal -->
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Batal
            </button>
            <!-- Tombol Simpan -->
            <button
              type="submit"
              :disabled="isSaving"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer"
            >
              <span v-if="isSaving">Menyimpan...</span>
              <span v-else>{{ isEditing ? 'Perbarui Produk' : 'Simpan Produk' }}</span>
            </button>
          </div>
        </form>

      </div>
    </div>

  </div>
</template>
