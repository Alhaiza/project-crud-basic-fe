<script setup lang="ts">
// 1. Menerapkan middleware rute 'auth': memastikan hanya pengguna terautentikasi yang bisa membuka halaman ini
definePageMeta({
  middleware: 'auth',
})

// 2. Mengakses instance $api kustom yang sudah diinjeksi oleh Nuxt plugin
const { $api } = useNuxtApp()

// 3. Mengakses data profil user, fungsi fetchUser, dan logout dari composable helper useAuth
const { user, fetchUser, logout } = useAuth()

// 4. State reaktif untuk menyimpan daftar produk dari backend
const products = ref<any[]>([])

// 5. State penanda loading saat aplikasi sedang melakukan fetch data dari API
const isLoading = ref(true)

// =========================================================================
// STATE MANAGEMENT MODAL (PENGGANTI BOOTSTRAP MODAL data-bs-toggle="modal")
// =========================================================================
// Di Bootstrap, modal dibuka/tutup menggunakan manipulasi DOM jQuery atau data attributes.
// Di Vue/Nuxt, modal dikendalikan murni oleh "Reactivity State" di bawah ini:
// isModalOpen bernilai true  -> Modal muncul (pop-out) ke layar.
// isModalOpen bernilai false -> Modal lenyap dari layar (v-if menghapusnya dari DOM).
const isModalOpen = ref(false)

// Penanda mode modal: true = Edit Produk (PUT), false = Tambah Produk Baru (POST)
const isEditing = ref(false)

// Menyimpan ID produk yang sedang aktif diedit (null jika sedang mode tambah baru)
const editingId = ref<number | null>(null)

// State reaktif form untuk menampung input user (nama & harga produk)
const form = reactive({
  name: '',
  price: 0,
})

// State penanda loading saat tombol simpan di modal sedang memproses request ke server
const isSaving = ref(false)

// State untuk menampung pesan error dari backend jika validasi gagal
const modalError = ref('')

// 6. Fungsi mengambil data produk dari endpoint GET /api/products
const loadProducts = async () => {
  isLoading.value = true
  try {
    const res: any = await $api('/products')
    // Laravel paginate mengembalikan array data di res.data.data (fallback res.data)
    products.value = res.data?.data || res.data || []
  } catch (error) {
    console.error('Gagal mengambil data produk:', error)
  } finally {
    isLoading.value = false
  }
}

// 7. Fungsi membuka modal untuk mode "Tambah Produk Baru"
// Logika: Reset isi form, set isEditing = false, lalu ubah isModalOpen = true
const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.name = ''
  form.price = 0
  modalError.value = ''
  isModalOpen.value = true // Memicu modal pop-out
}

// 8. Fungsi membuka modal untuk mode "Edit Produk"
// Logika: Isi form dengan data yang dipilih, set isEditing = true, lalu ubah isModalOpen = true
const openEditModal = (item: any) => {
  isEditing.value = true
  editingId.value = item.id
  form.name = item.name
  form.price = Number(item.price)
  modalError.value = ''
  isModalOpen.value = true // Memicu modal pop-out
}

// 9. Fungsi menutup modal
// Logika: Cukup ubah isModalOpen = false, v-if otomatis menghilangkan modal dari DOM
const closeModal = () => {
  isModalOpen.value = false
}

// 10. Fungsi submit form modal (Bisa POST untuk Tambah, atau PUT untuk Edit)
const handleSaveProduct = async () => {
  modalError.value = ''
  isSaving.value = true

  try {
    if (isEditing.value && editingId.value) {
      // Jika mode edit: Panggil PUT /api/products/{id}
      await $api(`/products/${editingId.value}`, {
        method: 'PUT',
        body: form,
      })
    } else {
      // Jika mode tambah: Panggil POST /api/products
      await $api('/products', {
        method: 'POST',
        body: form,
      })
    }

    // Tutup pop-out modal setelah berhasil simpan
    closeModal()
    // Muat ulang tabel dengan data terbaru dari database
    await loadProducts()
  } catch (err: any) {
    // Menangkap pesan validasi error dari Laravel
    modalError.value = err?.data?.message || 'Gagal menyimpan data produk.'
  } finally {
    isSaving.value = false
  }
}

// 11. Fungsi menghapus produk via endpoint DELETE /api/products/{id}
const handleDeleteProduct = async (id: number, name: string) => {
  const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)
  if (!confirmDelete) return

  try {
    await $api(`/products/${id}`, { method: 'DELETE' })
    // Muat ulang data setelah dihapus
    await loadProducts()
  } catch (error) {
    alert('Gagal menghapus produk.')
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
    <!-- MODAL POP-OUT (DIPINDAHKAN LANGSUNG KE <body> VIA <Teleport to="body">)   -->
    <!-- Persis seperti modal-backdrop di Bootstrap tapi dikendalikan State Vue    -->
    <!-- ========================================================================= -->
    <Teleport to="body">
      <!-- Transition bawaan Vue untuk efek animasi Pop-Out halus (zoom-in & fade) saat muncul -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <!-- BACKDROP OVERLAY LAYAR PENUH: -->
        <!-- v-if="isModalOpen": Muncul HANYA jika isModalOpen bernilai true -->
        <!-- fixed inset-0 (posisi absolut ke seluruh viewport layar), z-50 (lapisan tertinggi di atas semua elemen), bg-slate-900/60 (latar hitam transparan 60%), backdrop-blur-sm (efek blur kaca lembut pada background), flex items-center justify-center (menempatkan kartu modal tepat di tengah-tengah layar), p-4 (padding aman di perangkat mobile) -->
        <!-- @click.self="closeModal": Menutup modal jika pengguna mengklik area luar modal (backdrop) seperti Bootstrap -->
        <div
          v-if="isModalOpen"
          @click.self="closeModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <!-- KARTU DIALOG MODAL (POP-OUT CARD): -->
          <!-- relative (posisi relatif), w-full (lebar 100%), max-w-lg (maksimal lebar 32rem/512px), bg-white (latar kartu putih pekat), rounded-2xl (sudut tumpul halus), shadow-2xl (efek bayangan melayang tebal), border border-slate-100 (garis border tipis), overflow-hidden (sudut rapi) -->
          <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            
            <!-- HEADER MODAL: -->
            <!-- flex justify-between items-center (posisi judul di kiri, tombol silang di kanan), px-6 py-5 (padding dalam), border-b border-slate-100 (garis pemisah bawah) -->
            <div class="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <!-- Judul Modal dinamis berdasarkan state isEditing -->
                <h3 class="text-lg font-bold text-slate-900">
                  {{ isEditing ? 'Edit Informasi Produk' : 'Tambah Produk Baru' }}
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ isEditing ? 'Perbarui data nama dan harga produk di bawah ini.' : 'Masukkan nama dan harga untuk membuat produk baru.' }}
                </p>
              </div>

              <!-- Tombol Silang (X) Penutup Modal: -->
              <!-- text-slate-400 (warna abu-abu), hover:text-slate-600 (lebih gelap saat hover), hover:bg-slate-100 (lingkaran abu-abu saat hover), p-2 (padding tombol), rounded-xl (lingkaran tumpul) -->
              <button
                type="button"
                @click="closeModal"
                class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition duration-150 cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- BODY MODAL: Form Input -->
            <!-- p-6 (padding 1.5rem), space-y-4 (jarak vertikal 1rem antar-input form) -->
            <form @submit.prevent="handleSaveProduct" class="p-6 space-y-4">
              
              <!-- Pesan Error Validasi Modal (jika gagal) -->
              <div v-if="modalError" class="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ modalError }}</span>
              </div>

              <!-- Field Input Nama Produk -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Produk <span class="text-rose-500">*</span>
                </label>
                <!-- w-full (lebar 100%), px-4 py-2.5 (padding input), border border-slate-300 (garis border standar), rounded-xl (sudut melengkung halus), text-sm (font 14px), focus:ring-2 focus:ring-indigo-500 focus:border-transparent (outline fokus berwarna biru indigo saat kursor aktif) -->
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="Contoh: Kopi Robusta Premium"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                />
              </div>

              <!-- Field Input Harga Produk -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Harga Satuan (Rupiah) <span class="text-rose-500">*</span>
                </label>
                <!-- v-model.number: otomatis mengubah input string ke format angka JavaScript -->
                <input
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  required
                  placeholder="Contoh: 25000"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                />
              </div>

              <!-- FOOTER MODAL (TOMBOL AKSI BATAL & SIMPAN): -->
              <!-- flex justify-end gap-3 (menata tombol di kanan dengan jarak 0.75rem), pt-4 (padding atas), border-t border-slate-100 (garis batas atas) -->
              <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <!-- Tombol Batal: Menutup modal dengan @click="closeModal" -->
                <!-- px-4 py-2.5 (padding), text-sm font-medium (font sedang), text-slate-700 (teks abu-abu), bg-white (latar putih), border border-slate-300 (garis border), hover:bg-slate-50 (hover abu-abu muda), rounded-xl (sudut tumpul) -->
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition duration-150 cursor-pointer"
                >
                  Batal
                </button>

                <!-- Tombol Simpan Submit Form -->
                <!-- px-5 py-2.5 (padding), text-sm font-medium (font sedang), text-white (teks putih), bg-indigo-600 hover:bg-indigo-700 (latar biru indigo), rounded-xl (sudut tumpul), shadow-sm (bayangan halus), disabled:opacity-50 (redup saat sedang proses simpan) -->
                <button
                  type="submit"
                  :disabled="isSaving"
                  class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span v-if="isSaving" class="inline-flex items-center gap-1.5">
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Menyimpan...
                  </span>
                  <span v-else>
                    {{ isEditing ? 'Perbarui Produk' : 'Simpan Produk' }}
                  </span>
                </button>
              </div>

            </form>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>
