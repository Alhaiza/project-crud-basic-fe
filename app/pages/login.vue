<script setup lang="ts">
// 1. Menerapkan middleware rute 'guest': mencegah user yang sudah login membuka halaman ini
definePageMeta({
  middleware: 'guest',
})

// 2. Mengimpor fungsi login dari composable helper useAuth
const { login } = useAuth()

// 3. State reaktif untuk menampung input form (email dan password)
const form = reactive({
  email: '',
  password: '',
})

// 4. State untuk menampung pesan error jika proses autentikasi gagal
const errorMessage = ref('')

// 5. State penanda loading saat request sedang berlangsung ke server
const isLoading = ref(false)

// 6. Fungsi submit form login yang dipicu saat tombol ditekan
const handleLogin = async () => {
  // Reset pesan error sebelumnya sebelum kirim data baru
  errorMessage.value = ''
  // Aktifkan indikator loading
  isLoading.value = true

  try {
    // Memanggil method login pada useAuth yang akan me-request ke Laravel /api/login
    await login(form)
    // Jika berhasil, arahkan pengguna ke halaman dashboard/CRUD produk
    await navigateTo('/')
  } catch (err: any) {
    // Menangkap pesan error dari validasi backend Laravel
    errorMessage.value = err?.data?.message || 'Email atau password yang Anda masukkan salah.'
  } finally {
    // Matikan indikator loading baik request sukses maupun gagal
    isLoading.value = false
  }
}
</script>

<template>
  <!-- Container flexbox di tengah layar: min-h-screen (tinggi 100vh), flex items-center justify-center (posisi tengah), px-4 (padding samping) -->
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <!-- Kartu form: w-full (lebar 100%), max-w-md (maksimal 28rem/448px), bg-white (latar putih), p-8 (padding dalam 2rem), rounded-2xl (sudut melengkung halus), shadow-lg (efek bayangan kartu), border (garis border halus) -->
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      
      <!-- Judul dan deskripsi form login -->
      <div class="text-center mb-8">
        <!-- text-2xl (font 24px), font-bold (tebal), text-gray-900 (warna teks gelap) -->
        <h1 class="text-2xl font-bold text-gray-900">Masuk ke Akun</h1>
        <!-- text-sm (font 14px), text-gray-500 (warna teks abu-abu redup), mt-2 (margin atas 0.5rem) -->
        <p class="text-sm text-gray-500 mt-2">Gunakan kredensial Anda untuk mengakses sistem</p>
      </div>

      <!-- Kotak notifikasi pesan error jika login gagal -->
      <!-- mb-6 (margin bawah 1.5rem), p-4 (padding 1rem), bg-red-50 (latar merah muda), text-red-600 (teks merah), rounded-lg (sudut melengkung), text-sm (font 14px) -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
        {{ errorMessage }}
      </div>

      <!-- Form login: @submit.prevent untuk mencegah reload halaman bawaan browser -->
      <!-- space-y-5: memberi jarak vertikal 1.25rem antar-elemen form input -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        
        <!-- Field Input Email -->
        <div>
          <!-- block (tampilan block), text-sm (font 14px), font-medium (ketebalan medium), text-gray-700 (warna abu-abu gelap), mb-1 (margin bawah) -->
          <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
          <!-- w-full (lebar 100%), px-4 py-2.5 (padding dalam), border (garis border), rounded-lg (sudut melengkung), focus:outline-none focus:ring-2 focus:ring-blue-500 (efek glow biru saat kursor aktif) -->
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="nama@email.com"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <!-- Field Input Password -->
        <div>
          <!-- block (tampilan block), text-sm (font 14px), font-medium (ketebalan medium), text-gray-700 (warna abu-abu gelap), mb-1 (margin bawah) -->
          <label class="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
          <!-- w-full (lebar 100%), px-4 py-2.5 (padding dalam), border (garis border), rounded-lg (sudut melengkung), focus:ring-2 (fokus aktif) -->
          <input
            v-model="form.password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <!-- Tombol Submit Login -->
        <!-- w-full (lebar penuh), bg-blue-600 (warna dasar biru), hover:bg-blue-700 (biru lebih gelap saat hover), text-white (teks putih), py-2.5 (tinggi vertikal), rounded-lg (sudut melengkung), font-medium (font sedang), transition (animasi halus), disabled:opacity-50 (transparan jika disable) -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span v-if="isLoading">Memproses Masuk...</span>
          <span v-else>Masuk Sekarang</span>
        </button>
      </form>

      <!-- Navigasi tautan ke halaman registrasi -->
      <!-- text-center (posisi tengah), text-sm (font 14px), text-gray-600 (warna teks abu-abu), mt-6 (margin atas) -->
      <div class="text-center text-sm text-gray-600 mt-6">
        Belum punya akun?
        <!-- NuxtLink: komponen router Nuxt untuk navigasi instan tanpa refresh browser -->
        <!-- text-blue-600 (warna link biru), hover:underline (garis bawah saat kursor hover), font-medium (font sedang) -->
        <NuxtLink to="/register" class="text-blue-600 hover:underline font-medium ml-1">
          Daftar di sini
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
