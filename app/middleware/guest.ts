// Middleware rute untuk mencegah pengguna yang sudah login mengakses halaman tamu (login/register)
export default defineNuxtRouteMiddleware(() => {
  // 1. Memeriksa status autentikasi user melalui composable useAuth
  const { isAuthenticated } = useAuth()

  // 2. Jika user sudah login (memiliki token aktif), redirect ke halaman utama CRUD produk
  if (isAuthenticated.value) {
    return navigateTo('/')
  }
})
