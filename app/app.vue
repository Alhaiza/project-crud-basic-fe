<template>
  <!-- Wrapper utama: min-h-screen (tinggi minimal layar penuh), bg-slate-50 (latar abu-abu netral modern), text-slate-800, antialiased (penghalusan font) -->
  <div class="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
    <!-- Aksesibilitas navigasi bawaan Nuxt untuk pembaca layar (screen reader) -->
    <NuxtRouteAnnouncer />

    <!-- Me-render halaman aktif (pages/index.vue, pages/login.vue, pages/register.vue) -->
    <NuxtPage />

    <!-- Komponen Toast Notifikasi Global (Otomatis di-import oleh Nuxt dari components/AppToast.vue) -->
    <AppToast />
  </div>
</template>
