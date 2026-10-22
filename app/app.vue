<template>
  <!-- Wrapper utama: min-h-screen (tinggi minimal layar penuh), bg-slate-50 (latar abu-abu netral modern), text-slate-800 (warna teks tajam), antialiased (penghalusan font browser) -->
  <div class="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
    <!-- Aksesibilitas navigasi bawaan Nuxt untuk screen reader -->
    <NuxtRouteAnnouncer />

    <!-- Me-render halaman aktif (pages/index.vue, pages/login.vue, dll) -->
    <NuxtPage />
  </div>
</template>
