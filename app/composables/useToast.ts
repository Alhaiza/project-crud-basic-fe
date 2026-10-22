// Composable useToast untuk mengelola notifikasi toast pop-up global di Nuxt 4
export const useToast = () => {
  // 1. State global reaktif untuk data toast: visibilitas, teks pesan, dan tipe warna (success/error/info)
  const toast = useState('global_toast_state', () => ({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  }))

  // 2. State untuk menyimpan ID timer setTimeout agar dapat di-reset jika ada aksi berulang
  const timer = useState<any>('global_toast_timer', () => null)

  // 3. Fungsi memunculkan toast dengan teks pesan, tipe warna, dan durasi tayang (milidetik)
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) => {
    // Jika timer sebelumnya masih berjalan, batalkan timer tersebut
    if (timer.value) {
      clearTimeout(timer.value)
    }

    // Perbarui isi pesan, tipe, dan ubah status show menjadi true (membuat toast muncul)
    toast.value = {
      show: true,
      message,
      type,
    }

    // Pasang timer otomatis: setelah durasi habis, ubah show menjadi false (toast menghilang)
    timer.value = setTimeout(() => {
      toast.value.show = false
    }, duration)
  }

  // 4. Shortcut fungsi untuk notifikasi BERHASIL (warna HIJAU)
  const success = (message: string, duration = 3000) => showToast(message, 'success', duration)

  // 5. Shortcut fungsi untuk notifikasi GAGAL/ERROR (warna MERAH)
  const error = (message: string, duration = 3500) => showToast(message, 'error', duration)

  // 6. Fungsi menutup toast secara instan (misal saat pengguna menekan tombol X pada toast)
  const close = () => {
    toast.value.show = false
    if (timer.value) {
      clearTimeout(timer.value)
    }
  }

  return {
    toast,
    showToast,
    success,
    error,
    close,
  }
}
