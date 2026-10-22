<script setup lang="ts">
// Mengakses data toast reaktif dan fungsi tutup dari helper composable useToast
const { toast, close } = useToast()
</script>

<template>
  <!-- Wrapper utama: min-h-screen (tinggi minimal layar penuh), bg-slate-50 (latar abu-abu netral modern), text-slate-800 (warna teks tajam), antialiased (penghalusan font browser) -->
  <div class="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
    <!-- Aksesibilitas navigasi bawaan Nuxt untuk screen reader -->
    <NuxtRouteAnnouncer />

    <!-- Me-render halaman aktif (pages/index.vue, pages/login.vue, dll) -->
    <NuxtPage />

    <!-- ========================================================================= -->
    <!-- KOMPONEN TOAST NOTIFIKASI GLOBAL (POJOK KANAN ATAS LAYAR)                -->
    <!-- ========================================================================= -->
    <!-- fixed top-5 right-5 (terpaku di pojok kanan atas layar), z-50 (lapisan tertinggi), max-w-sm (lebar maksimal 384px), w-full (lebar 100%), pointer-events-none (klik tembus jika tidak ada toast) -->
    <div class="fixed top-5 right-5 z-50 max-w-sm w-full pointer-events-none">
      <!-- Transition Vue: animasi halus pop-down dan fade saat toast muncul / lenyap -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-[-12px] scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-[-12px] scale-95"
      >
        <!-- Kartu Toast: pointer-events-auto (tombol bisa diklik), flex items-center justify-between (tata letak rapi), p-4 (padding dalam 1rem), rounded-2xl (sudut membulat modern), shadow-xl (bayangan tebal lembut), border (garis border) -->
        <div
          v-if="toast.show"
          class="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl shadow-xl border bg-white transition-all duration-200"
          :class="[
            // Jika sukses: border hijau emerald halus
            toast.type === 'success' ? 'border-emerald-200 shadow-emerald-500/10' : '',
            // Jika gagal/error: border merah rose halus
            toast.type === 'error' ? 'border-rose-200 shadow-rose-500/10' : '',
            // Jika info: border biru indigo halus
            toast.type === 'info' ? 'border-indigo-200 shadow-indigo-500/10' : '',
          ]"
        >
          <!-- Sisi Kiri: Icon Status dan Teks Pesan -->
          <div class="flex items-center gap-3 min-w-0">
            <!-- Icon Container: w-9 h-9 (ukuran 36px), rounded-xl (sudut lengkung), flex items-center justify-center (icon di tengah), shrink-0 (mencegah icon mengecil) -->
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              :class="[
                // Warna HIJAU jika response BERHASIL
                toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : '',
                // Warna MERAH jika response GAGAL / ERROR
                toast.type === 'error' ? 'bg-rose-50 text-rose-600' : '',
                // Warna BIRU jika response INFORMASI
                toast.type === 'info' ? 'bg-indigo-50 text-indigo-600' : '',
              ]"
            >
              <!-- Icon Centang Hijau untuk Sukses -->
              <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <!-- Icon Tanda Seru Merah untuk Gagal / Error -->
              <svg v-else-if="toast.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <!-- Icon i Biru untuk Info -->
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <!-- Teks Pesan Toast: text-sm (font 14px), font-medium (ketebalan 500), text-slate-800 (teks gelap) -->
            <p class="text-sm font-medium text-slate-800 leading-snug">
              {{ toast.message }}
            </p>
          </div>

          <!-- Tombol Silang (X) Penutup Toast Manual -->
          <!-- text-slate-400 (warna abu-abu redup), hover:text-slate-600 (teks gelap saat hover), hover:bg-slate-100 (lingkaran abu-abu saat hover), p-1.5 (padding), rounded-lg (sudut lengkung), transition (transisi halus) -->
          <button
            @click="close"
            type="button"
            class="shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition duration-150 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Transition>
    </div>

  </div>
</template>
