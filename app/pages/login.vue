<script setup lang="ts">
/**
 * ==========================================================================================
 * HALAMAN: Login (app/pages/login.vue)
 * ==========================================================================================
 * Alur Kerja:
 * 1. Pengguna memasukkan alamat email dan kata sandi pada form.
 * 2. Form dikirimkan melalui fungsi handleLogin().
 * 3. Memanggil helper login() dari app/composables/useAuth.ts yang me-request ke Laravel POST /api/login.
 * 4. Jika kredensial cocok: Toast hijau muncul via useToast.ts dan dialihkan ke rute utama '/' (dashboard).
 * 5. Jika kredensial salah: Toast merah muncul dan pesan error ditampilkan di bawah judul form.
 * 
 * Asal Variabel & Dependensi:
 * - definePageMeta : Compiler macro Nuxt (menetapkan middleware 'guest' dari app/middleware/guest.ts).
 * - login          : Berasal dari composable helper app/composables/useAuth.ts.
 * - toast          : Berasal dari composable helper app/composables/useToast.ts.
 * - reactive, ref  : Bawaan Vue 3 Composition API (state management reaktif lokal).
 * - navigateTo     : Bawaan Nuxt (fungsi redirect rute).
 * ==========================================================================================
 */

// Sintaks definePageMeta: Fitur khusus Nuxt untuk mendaftarkan konfigurasi halaman.
// Di sini kita memasang middleware 'guest' agar user yang SUDAH login tidak bisa membuka halaman login ini.
definePageMeta({
  middleware: 'guest',
})

// Mengambil fungsi login dari composable useAuth dan instance toast dari useToast
const { login } = useAuth()
const toast = useToast()

// Sintaks 'reactive': Membuat objek JavaScript reaktif untuk menampung field input form
const form = reactive({
  email: '',
  password: '',
})

// Sintaks 'ref': Membuat variabel reaktif bertipe primitif (string & boolean)
const errorMessage = ref('')
const isLoading = ref(false)

// Fungsi yang dieksekusi saat tombol 'Masuk Sekarang' ditekan
const handleLogin = async () => {
  // 1. Bersihkan pesan error lama sebelum mencoba login
  errorMessage.value = ''
  // 2. Aktifkan indikator loading untuk menonaktifkan tombol submit
  isLoading.value = true

  try {
    // 3. Panggil method login di useAuth (mengirim form.email dan form.password ke Laravel)
    await login(form)
    
    // 4. Tampilkan feedback visual toast warna HIJAU di pojok kanan atas
    toast.success('Login berhasil! Selamat datang kembali.')
    
    // 5. Alihkan rute pengguna ke halaman utama (katalog produk)
    await navigateTo('/')
  } catch (err: any) {
    // 6. Tangkap pesan error dari response validasi backend Laravel
    const msg = err?.data?.message || 'Email atau password yang Anda masukkan salah.'
    errorMessage.value = msg
    
    // 7. Tampilkan feedback visual toast warna MERAH di pojok kanan atas
    toast.error(msg)
  } finally {
    // 8. Matikan status loading agar form bisa dipakai kembali
    isLoading.value = false
  }
}
</script>

<template>
  <!-- min-h-screen (tinggi minimal 100vh) | flex items-center justify-center (menempatkan form tepat di tengah layar) | px-4 py-12 (padding sekeliling) -->
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <!-- w-full max-w-md (lebar kartu maks 448px) | bg-white (latar kartu putih) | p-8 (padding dalam 2rem) | rounded-2xl (sudut membulat modern) | shadow-lg (efek bayangan melayang) | border border-gray-100 (garis tepi lembut) -->
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      
      <!-- Header Judul Form -->
      <div class="text-center mb-8">
        <!-- text-2xl font-bold (ukuran 24px tebal) | text-gray-900 (warna teks gelap pekat) -->
        <h1 class="text-2xl font-bold text-gray-900">Masuk ke Akun</h1>
        <!-- text-sm text-gray-500 (font 14px abu-abu redup) | mt-2 (jarak atas 0.5rem) -->
        <p class="text-sm text-gray-500 mt-2">Gunakan kredensial Anda untuk mengakses sistem</p>
      </div>

      <!-- Kotak Alert Notifikasi Error (Hanya tampil jika errorMessage memiliki nilai) -->
      <!-- mb-6 (margin bawah 1.5rem) | p-4 (padding 1rem) | bg-red-50 (latar merah muda) | text-red-600 (teks merah) | border border-red-200 (garis batas merah) | rounded-lg (sudut membulat) | text-sm (font 14px) -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
        {{ errorMessage }}
      </div>

      <!-- Form Login: Sintaks '@submit.prevent' adalah event modifier Vue untuk mencegah perilaku reload halaman default browser -->
      <!-- space-y-5: Memberi jarak vertikal otomatis sebesar 1.25rem di antara setiap elemen input anak -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        
        <!-- Field Input Alamat Email -->
        <div>
          <!-- block (display block) | text-sm font-medium (font 14px medium) | text-gray-700 (warna abu-abu gelap) | mb-1 (margin bawah) -->
          <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
          <!-- v-model="form.email": Two-way data binding Vue yang menyinkronkan ketikan input dengan variabel form.email -->
          <!-- w-full (lebar 100%) | px-4 py-2.5 (padding dalam) | border border-gray-300 (garis tepi) | rounded-lg (sudut tumpul) | text-sm (font 14px) | focus:ring-2 focus:ring-blue-500 (garis cahaya biru saat kursor aktif di input) -->
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="nama@email.com"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <!-- Field Input Kata Sandi -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
          <!-- v-model="form.password": Menyinkronkan teks sandi dengan form.password -->
          <input
            v-model="form.password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <!-- Tombol Aksi Submit Form -->
        <!-- :disabled="isLoading": Menonaktifkan tombol secara otomatis saat request sedang berjalan -->
        <!-- w-full (lebar 100%) | bg-blue-600 hover:bg-blue-700 (latar biru utama dan efek hover lebih gelap) | text-white (font putih) | py-2.5 (tinggi tombol) | rounded-lg (border radius) | font-medium (ketebalan font 500) | disabled:opacity-50 (tampilan redup 50% jika disabled) -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span v-if="isLoading">Memproses Masuk...</span>
          <span v-else>Masuk Sekarang</span>
        </button>
      </form>

      <!-- Navigasi Tautan Menuju Halaman Registrasi -->
      <!-- text-center (tengah) | text-sm text-gray-600 (font 14px abu-abu) | mt-6 (jarak atas 1.5rem) -->
      <div class="text-center text-sm text-gray-600 mt-6">
        Belum punya akun?
        <!-- NuxtLink: Komponen routing bawaan Nuxt untuk perpindahan halaman SPA (Single Page Application) super cepat tanpa reload browser -->
        <!-- text-blue-600 (warna teks biru) | hover:underline (garis bawah saat kursor diarahkan) | font-medium (font sedang) -->
        <NuxtLink to="/register" class="text-blue-600 hover:underline font-medium ml-1">
          Daftar di sini
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
