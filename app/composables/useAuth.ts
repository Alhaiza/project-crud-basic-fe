/**
 * ==========================================================================================
 * MODUL HELPER: useAuth (app/composables/useAuth.ts)
 * ==========================================================================================
 * Alur Kerja Utama:
 * 1. Register : Kirim data user -> Terima Bearer Token dari Laravel -> Simpan ke cookie -> Simpan user ke state.
 * 2. Login    : Kirim kredensial -> Terima Bearer Token dari Laravel -> Simpan ke cookie -> Simpan user ke state.
 * 3. Me       : Ambil token dari cookie -> Panggil GET /api/me -> Update state data profil user.
 * 4. Logout   : Panggil POST /api/logout di Laravel -> Hapus token di cookie & reset state -> Redirect ke /login.
 * 
 * Asal Variabel & Dependensi:
 * - $api         : Berasal dari app/plugins/api.ts (Instance $fetch kustom dengan baseURL & auth header).
 * - useNuxtApp   : Bawaan Nuxt (mengakses dependency injection Nuxt Context).
 * - useCookie    : Bawaan Nuxt (membaca/menulis cookie browser & SSR header secara aman).
 * - useState     : Bawaan Nuxt (state reaktif global yang aman dari data leak pada Server-Side Rendering).
 * - computed     : Bawaan Vue 3 (menghitung nilai turunan otomatis berdasarkan perubahan state).
 * - navigateTo   : Bawaan Nuxt (melakukan pengalihan rute halaman / redirect).
 * ==========================================================================================
 */

export const useAuth = () => {
  // Mengambil helper $api yang telah didaftarkan melalui defineNuxtPlugin di app/plugins/api.ts
  const { $api } = useNuxtApp()

  // Menyimpan token otorisasi ke dalam HTTP Cookie browser bernama 'auth_token'.
  // Sintaks generik <string | null> memastikan TypeScript memahami bahwa nilai token bisa bertipe string atau null.
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // Durasi aktif: 7 hari (dalam hitungan detik: 60dtk * 60mnt * 24jam * 7hari)
    path: '/',                // Cookie berlaku untuk semua rute di domain ini
  })

  // State global user profile. Menggunakan useState('auth_user') agar nilai user tersinkronisasi
  // di semua komponen Vue dan tidak bocor ke request pengguna lain saat proses SSR di server.
  const user = useState<any>('auth_user', () => null)

  // Computed Property: Menghasilkan boolean true/false secara otomatis.
  // Sintaks '!!' (double negation): Mengubah nilai truthy string token menjadi boolean murni true,
  // atau null/undefined menjadi false.
  const isAuthenticated = computed(() => !!token.value)

  // ----------------------------------------------------------------------------------------
  // ALUR FITUR: LOGIN
  // ----------------------------------------------------------------------------------------
  const login = async (credentials: { email: string; password: string }) => {
    // 1. Kirim request HTTP POST ke endpoint Laravel: /api/login (didefinisikan di routes/api.php)
    const response: any = await $api('/login', {
      method: 'POST',
      body: credentials,
    })

    // 2. Ekstrak 'access_token' dari response JSON Laravel (ApiResponse trait: res.data.access_token)
    // dan simpan langsung ke cookie 'auth_token'
    token.value = response.data.access_token

    // 3. Simpan objek data user ke dalam state reaktif global Nuxt
    user.value = response.data.user

    return response
  }

  // ----------------------------------------------------------------------------------------
  // ALUR FITUR: REGISTER
  // ----------------------------------------------------------------------------------------
  const register = async (payload: { name: string; email: string; password: string }) => {
    // 1. Kirim request HTTP POST ke endpoint Laravel: /api/register
    const response: any = await $api('/register', {
      method: 'POST',
      body: payload,
    })

    // 2. Laravel otomatis me-generate token untuk pendaftar baru, simpan ke cookie
    token.value = response.data.access_token

    // 3. Simpan data user baru ke state global
    user.value = response.data.user

    return response
  }

  // ----------------------------------------------------------------------------------------
  // ALUR FITUR: AMBIL PROFIL USER (SHOW DATA USER / ME)
  // ----------------------------------------------------------------------------------------
  const fetchUser = async () => {
    // Jika tidak ada token di cookie, batalkan pemanggilan API
    if (!token.value) return null

    try {
      // Panggil GET /api/me. Plugin app/plugins/api.ts akan otomatis menyisipkan
      // header "Authorization: Bearer <token>" dari cookie yang tersimpan.
      const response: any = await $api('/me')
      user.value = response.data
      return user.value
    } catch (error) {
      // Jika token ditolak atau kedaluwarsa di backend (401 Unauthorized), reset sesi lokal
      token.value = null
      user.value = null
      return null
    }
  }

  // ----------------------------------------------------------------------------------------
  // ALUR FITUR: LOGOUT
  // ----------------------------------------------------------------------------------------
  const logout = async () => {
    try {
      // 1. Panggil POST /api/logout di Laravel untuk menghapus personal_access_tokens di database
      await $api('/logout', { method: 'POST' })
    } catch (error) {
      // Abaikan error jika token di backend ternyata sudah hangus/terhapus sebelumnya
    } finally {
      // 2. Blok finally selalu dieksekusi: hapus cookie auth_token dari browser
      token.value = null

      // 3. Reset state user kembali menjadi null
      user.value = null

      // 4. Arahkan rute pengguna secara programmatic kembali ke form login
      await navigateTo('/login')
    }
  }

  // Ekspor seluruh state dan method agar bisa diakses langsung via const { ... } = useAuth()
  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    fetchUser,
    logout,
  }
}
