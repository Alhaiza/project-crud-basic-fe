export default defineNuxtPlugin(() => {
  // 1. Membaca konfigurasi publik (apiBase) dari runtimeConfig (nuxt.config.ts / .env)
  const config = useRuntimeConfig()

  // 2. Membuat instance custom $fetch terisolasi dengan preset baseURL dan interceptor
  const apiFetch = $fetch.create({
    // Menetapkan basis URL endpoint backend (misal: http://localhost:8000/api)
    baseURL: config.public.apiBase,

    // Interceptor yang dieksekusi sebelum HTTP request dikirimkan
    onRequest({ options }) {
      // Mengambil token autentikasi dari cookie lokal (SSR & client-friendly)
      const token = useCookie('auth_token').value

      // Jika token tersedia (user terautentikasi), sematkan ke header request
      if (token) {
        // Menginisialisasi instance Web API Headers untuk menjaga validitas tipe dan header sebelumnya
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${token}`)
        options.headers = headers
      }
    },
  })

  // 3. Menyediakan instance $api ke Nuxt Context (bisa dipanggil via useNuxtApp().$api)
  return {
    provide: {
      api: apiFetch,
    },
  }
})
