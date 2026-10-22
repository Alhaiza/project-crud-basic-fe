<template>
  <!-- Wrapper utama aplikasi: min-h-screen = tinggi 100vh, bg-gray-50 = latar abu-abu muda, text-gray-900 = warna font gelap -->
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <!-- Komponen bawaan Nuxt untuk aksesibilitas navigasi pembaca layar (screen reader) -->
    <NuxtRouteAnnouncer />

    <!-- NuxtPage bertugas me-render komponen halaman dinamis yang ada di folder app/pages/ -->
    <NuxtPage />
  </div>
</template>
