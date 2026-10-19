import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      // 5. Helper Endpoint: Base URL API Backend (otomatis di-override oleh env NUXT_PUBLIC_API_BASE)
      apiBase: 'http://localhost:8000/api',
    },
  },
})
