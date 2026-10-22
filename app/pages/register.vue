<script setup lang="ts">
// 1. Menerapkan middleware rute 'guest': mencegah user yang sudah login mengakses halaman registrasi
definePageMeta({
  middleware: 'guest',
})

// 2. Mengimpor fungsi register dari composable helper useAuth
const { register } = useAuth()

// 3. State reaktif untuk menampung field input registrasi user
const form = reactive({
  name: '',
  email: '',
  password: '',
})

// 4. State untuk menampung pesan error jika proses registrasi gagal dari server
const errorMessage = ref('')

// 5. State penanda loading saat pengiriman data registrasi ke server
const isLoading = ref(false)

// 6. Handler submit form registrasi
const handleRegister = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    // Mengirim data pendaftaran ke backend Laravel via useAuth
    await register(form)
    // Jika registrasi sukses, arahkan langsung ke halaman utama CRUD produk
    await navigateTo('/')
  } catch (err: any) {
    // Menampilkan pesan error validasi dari Laravel (misal email sudah terdaftar)
    errorMessage.value = err?.data?.message || 'Registrasi gagal. Mohon periksa kembali data Anda.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <!-- Container layar penuh di tengah: min-h-screen (tinggi 100vh), flex items-center justify-center (pusat tengah), px-4 (padding horizontal) -->
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <!-- Kartu form register: max-w-md (lebar maks 448px), w-full (lebar 100%), bg-white (latar putih), p-8 (padding 2rem), rounded-2xl (sudut tumpul), shadow-lg (bayangan lembut), border (garis tepi) -->
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      
      <!-- Judul dan subjudul halaman -->
      <div class="text-center mb-8">
        <!-- text-2xl (ukuran teks 24px), font-bold (tebal), text-gray-900 (warna teks abu-abu gelap) -->
        <h1 class="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
        <!-- text-sm (font 14px), text-gray-500 (warna redup), mt-2 (jarak atas) -->
        <p class="text-sm text-gray-500 mt-2">Daftarkan akun untuk mulai mengelola produk</p>
      </div>

      <!-- Kotak pesan error jika validasi gagal -->
      <!-- mb-6 (margin bawah 1.5rem), p-4 (padding 1rem), bg-red-50 (latar merah muda), text-red-600 (teks merah), rounded-lg (border radius), text-sm (font 14px) -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
        {{ errorMessage }}
      </div>

      <!-- Form registrasi: @submit.prevent mencegah reload browser -->
      <!-- space-y-5 (jarak vertikal 1.25rem antar-elemen input) -->
      <form @submit.prevent="handleRegister" class="space-y-5">
        
        <!-- Input Nama Lengkap -->
        <div>
          <!-- block (tampilan block), text-sm (font 14px), font-medium (ketebalan medium), text-gray-700 (warna abu-abu gelap), mb-1 (margin bawah) -->
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
          <!-- w-full (lebar penuh), px-4 py-2.5 (padding dalam), border (garis tepi), rounded-lg (sudut tumpul), focus:ring-2 (glow saat fokus) -->
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="John Doe"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <!-- Input Alamat Email -->
        <div>
          <!-- block (tampilan block), text-sm (font 14px), font-medium (ketebalan medium), text-gray-700 (warna abu-abu gelap), mb-1 (margin bawah) -->
          <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
          <!-- w-full (lebar penuh), px-4 py-2.5 (padding dalam), border (garis tepi), rounded-lg (sudut tumpul), focus:ring-2 (glow saat fokus) -->
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="nama@email.com"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <!-- Input Kata Sandi (Minimal 8 Karakter) -->
        <div>
          <!-- block (tampilan block), text-sm (font 14px), font-medium (ketebalan medium), text-gray-700 (warna abu-abu gelap), mb-1 (margin bawah) -->
          <label class="block text-sm font-medium text-gray-700 mb-1">Kata Sandi (Min. 8 karakter)</label>
          <!-- w-full (lebar penuh), px-4 py-2.5 (padding dalam), border (garis tepi), rounded-lg (sudut tumpul), focus:ring-2 (glow saat fokus) -->
          <input
            v-model="form.password"
            type="password"
            required
            minlength="8"
            placeholder="••••••••"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <!-- Tombol Submit Registrasi -->
        <!-- w-full (lebar penuh), bg-blue-600 (latar biru), hover:bg-blue-700 (hover lebih gelap), text-white (teks putih), py-2.5 (tinggi tombol), rounded-lg (border radius), font-medium (font sedang) -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span v-if="isLoading">Mendaftarkan Akun...</span>
          <span v-else>Daftar Akun</span>
        </button>
      </form>

      <!-- Navigasi kembali ke form login -->
      <!-- text-center (tengah), text-sm (font 14px), text-gray-600 (warna abu-abu), mt-6 (jarak atas) -->
      <div class="text-center text-sm text-gray-600 mt-6">
        Sudah memiliki akun?
        <!-- NuxtLink: router link bawaan Nuxt tanpa refresh halaman -->
        <!-- text-blue-600 (warna biru), hover:underline (garis bawah saat hover), font-medium (font sedang) -->
        <NuxtLink to="/login" class="text-blue-600 hover:underline font-medium ml-1">
          Masuk di sini
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
