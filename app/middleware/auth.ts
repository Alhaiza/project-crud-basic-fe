// Middleware rute untuk memproteksi halaman yang membutuhkan autentikasi
export default defineNuxtRouteMiddleware(() => {
  // 1. Memeriksa status autentikasi user melalui composable useAuth
  const { isAuthenticated } = useAuth()

  // 2. Jika user belum terautentikasi (belum login / tidak ada token), redirect ke /login
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
