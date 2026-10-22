// Composable useAuth untuk mengelola autentikasi reaktif di Nuxt 4
export const useAuth = () => {
  // 1. Mengakses instance $api kustom yang sudah diinjeksi oleh plugin api.ts
  const { $api } = useNuxtApp()

  // 2. State token berbasis cookie (disimpan di browser dan terbaca saat SSR)
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // Masa aktif cookie 7 hari dalam detik
    path: '/',                // Berlaku untuk semua rute aplikasi
  })

  // 3. State user reaktif global Nuxt yang aman dari state leak antar-request SSR
  const user = useState<any>('auth_user', () => null)

  // 4. Getter status autentikasi: bernilai true jika token tersedia
  const isAuthenticated = computed(() => !!token.value)

  // 5. Fungsi Login: mengirim kredensial ke API Laravel dan menyimpan token
  const login = async (credentials: { email: string; password: string }) => {
    // Memanggil endpoint POST /api/login via helper $api
    const response: any = await $api('/login', {
      method: 'POST',
      body: credentials,
    })

    // Menyimpan token yang didapat dari response Laravel ke cookie auth_token
    token.value = response.data.access_token

    // Menyimpan profile user ke state reaktif global
    user.value = response.data.user

    return response
  }

  // 6. Fungsi Register: mendaftarkan user baru dan langsung mencatat token
  const register = async (payload: { name: string; email: string; password: string }) => {
    // Memanggil endpoint POST /api/register
    const response: any = await $api('/register', {
      method: 'POST',
      body: payload,
    })

    // Menyimpan token baru ke cookie
    token.value = response.data.access_token

    // Menyimpan data user baru ke state
    user.value = response.data.user

    return response
  }

  // 7. Fungsi Fetch User Profile: mengambil data user yang sedang login dari /api/me
  const fetchUser = async () => {
    // Jika tidak ada token di cookie, batalkan pengambilan data
    if (!token.value) return null

    try {
      // Memanggil endpoint terproteksi GET /api/me
      const response: any = await $api('/me')
      user.value = response.data
      return user.value
    } catch (error) {
      // Jika token tidak valid / kedaluwarsa, bersihkan sesi
      token.value = null
      user.value = null
      return null
    }
  }

  // 8. Fungsi Logout: menghapus sesi di backend dan membersihkan cookie/state di frontend
  const logout = async () => {
    try {
      // Memanggil endpoint POST /api/logout di backend Laravel
      await $api('/logout', { method: 'POST' })
    } catch (error) {
      // Abaikan error jika token di backend sudah kedaluwarsa
    } finally {
      // Menghapus nilai cookie auth_token di browser
      token.value = null

      // Mereset state user global kembali menjadi null
      user.value = null

      // Mengalihkan halaman pengguna kembali ke form login
      await navigateTo('/login')
    }
  }

  // Mengembalikan variabel dan fungsi agar dapat dipakai di halaman dan komponen
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
