<script setup lang="ts">
/**
 * ==========================================================================================
 * HALAMAN: Register (app/pages/register.vue)
 * ==========================================================================================
 * Alur Kerja:
 * 1. Pengguna mengisi Nama Lengkap, Alamat Email, dan Kata Sandi (minimal 8 karakter).
 * 2. Form dikirimkan melalui fungsi handleRegister().
 * 3. Memanggil helper register() dari app/composables/useAuth.ts yang mengirim payload ke Laravel POST /api/register.
 * 4. Backend Laravel memvalidasi data, melakukan hashing password (Bcrypt), menyimpan record ke database MySQL, dan menghasilkan token Sanctum.
 * 5. Jika sukses: Token disimpan di cookie 'auth_token', Toast hijau muncul, dan pengguna diarahkan ke dashboard '/'.
 * 6. Jika gagal: Pesan validasi error dari Laravel (misal email duplikat) ditampilkan via Toast merah.
 * 
 * Asal Variabel & Dependensi:
 * - definePageMeta : Compiler macro Nuxt (memasang middleware 'guest' dari app/middleware/guest.ts).
 * - register       : Berasal dari composable helper app/composables/useAuth.ts.
 * - toast          : Berasal dari composable helper app/composables/useToast.ts.
 * - reactive, ref  : Bawaan Vue 3 Composition API (state management reaktif).
 * - navigateTo     : Bawaan Nuxt (fungsi redirect halaman).
 * ==========================================================================================
 */

// Menetapkan middleware 'guest' agar user yang sudah login tidak bisa mengakses pendaftaran ulang
definePageMeta({
  middleware: 'guest',
})

// Mengambil fungsi register dari composable useAuth dan instance toast dari useToast
const { register } = useAuth()
const toast = useToast()

// Objek reaktif untuk menampung seluruh field pendaftaran
const form = reactive({
  name: '',
  email: '',
  password: '',
})

// State untuk menyimpan pesan error dan status loading
const errorMessage = ref('')
const isLoading = ref(false)

// Handler pengiriman form registrasi
const handleRegister = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    // 1. Eksekusi fungsi register dengan mengirim objek form ke endpoint POST /api/register
    await register(form)
    
    // 2. Tampilkan notifikasi Toast HIJAU bahwa registrasi dan login otomatis sukses
    toast.success('Pendaftaran akun berhasil! Selamat bergabung.')
    
    // 3. Alihkan pengguna langsung ke dashboard katalog produk
    await navigateTo('/')
  } catch (err: any) {
    // 4. Tangkap pesan error dari validasi Laravel (contoh: "The email has already been taken.")
    const msg = err?.data?.message || 'Registrasi gagal. Mohon periksa kembali data Anda.'
    errorMessage.value = msg
    
    // 5. Tampilkan notifikasi Toast MERAH
    toast.error(msg)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <!-- min-h-screen (tinggi minimal 100vh) | flex items-center justify-center (posisi tengah layar) | px-4 py-12 (padding sekeliling) -->
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <!-- w-full max-w-md (lebar kartu maks 448px) | bg-white (latar putih) | p-8 (padding 2rem) | rounded-2xl (sudut membulat modern) | shadow-lg (efek bayangan halus) | border border-gray-100 (garis tepi lembut) -->
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      
      <!-- Header Judul Registrasi -->
      <div class="text-center mb-8">
        <!-- text-2xl font-bold (font 24px tebal) | text-gray-900 (warna teks gelap pekat) -->
        <h1 class="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
        <!-- text-sm text-gray-500 (font 14px abu-abu redup) | mt-2 (jarak atas 0.5rem) -->
        <p class="text-sm text-gray-500 mt-2">Daftarkan akun untuk mulai mengelola produk</p>
      </div>

      <!-- Kotak Alert Notifikasi Error -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
        {{ errorMessage }}
      </div>

      <!-- Form Registrasi: @submit.prevent mencegah reload browser default -->
      <!-- space-y-5: Memberi jarak vertikal 1.25rem di antara setiap field input -->
      <form @submit.prevent="handleRegister" class="space-y-5">
        
        <!-- Field Input Nama Lengkap -->
        <div>
          <!-- block | text-sm font-medium | text-gray-700 | mb-1 -->
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
          <!-- v-model="form.name": Two-way data binding ke properti form.name -->
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="John Doe"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <!-- Field Input Alamat Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
          <!-- v-model="form.email": Two-way data binding ke properti form.email -->
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Kata Sandi (Min. 8 karakter)</label>
          <!-- minlength="8": Validasi sisi klien bawaan HTML5 agar sesuai aturan validasi Laravel 'min:8' -->
          <input
            v-model="form.password"
            type="password"
            required
            minlength="8"
            placeholder="••••••••"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <!-- Tombol Aksi Submit Registrasi -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span v-if="isLoading">Mendaftarkan Akun...</span>
          <span v-else>Daftar Akun</span>
        </button>
      </form>

      <!-- Navigasi Tautan Kembali ke Form Login -->
      <div class="text-center text-sm text-gray-600 mt-6">
        Sudah memiliki akun?
        <NuxtLink to="/login" class="text-blue-600 hover:underline font-medium ml-1">
          Masuk di sini
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
