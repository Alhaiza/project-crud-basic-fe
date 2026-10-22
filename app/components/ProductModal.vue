<script setup lang="ts">
/**
 * ==========================================================================================
 * KOMPONEN: ProductModal (app/components/ProductModal.vue)
 * ==========================================================================================
 * Alur Kerja Terpadu (Create & Update):
 * 1. Buka Modal     : Dipicu dari index.vue saat isOpen bernilai true.
 * 2. Deteksi Mode   : isEditing mendeteksi otomatis keberadaan props.product.id.
 *                     - null / undefined -> Mode TAMBAH PRODUK BARU (POST).
 *                     - objek produk      -> Mode EDIT PRODUK (PUT).
 * 3. Sinkronisasi   : Watcher mengisi input form dengan data produk (jika edit) atau mengosongkannya (jika tambah).
 * 4. Format Harga   : handlePriceInput() otomatis menambahkan titik ribuan (misal: 10000 -> 10.000)
 *                     secara visual, sembari menyimpan integer murni di form.price untuk backend Laravel.
 * 5. Eksekusi Simpan: handleSave() memanggil endpoint API sesuai mode:
 *                     - POST /api/products (Tambah)
 *                     - PUT /api/products/{id} (Update)
 * 6. Emit Feedback  : Pancarkan emit('saved') untuk refresh tabel di index.vue dan emit('close') untuk tutup modal.
 * 
 * Asal Variabel & Dependensi:
 * - defineProps    : Compiler macro Vue 3 (menerima data isOpen dan product dari index.vue).
 * - defineEmits    : Compiler macro Vue 3 (memancarkan event 'close' dan 'saved' ke index.vue).
 * - $api           : Berasal dari app/plugins/api.ts (klien HTTP $fetch kustom).
 * - useToast       : Berasal dari app/composables/useToast.ts (trigger notifikasi hijau/merah di kanan atas).
 * - computed, watch: Bawaan Vue 3 Composition API.
 * - Teleport       : Komponen bawaan Vue 3 (memindahkan rendering modal langsung ke tag <body>).
 * - Transition     : Komponen bawaan Vue 3 (animasi CSS zoom-in dan fade saat modal muncul).
 * ==========================================================================================
 */

// 1. Deklarasi interface TypeScript untuk props dari komponen induk (index.vue)
interface Props {
  isOpen: boolean
  product?: { id: number; name: string; price: number | string } | null
}

const props = defineProps<Props>()

// 2. Deklarasi event custom yang dapat dipancarkan ke komponen induk
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

// 3. Mengakses helper $api (klien HTTP) dan instance toast notifikasi
const { $api } = useNuxtApp()
const toast = useToast()

// 4. Computed Property: Menentukan mode form secara reaktif.
// Bernilai true jika props.product memiliki properti 'id' (Mode Update), bernilai false jika null (Mode Create).
const isEditing = computed(() => !!props.product?.id)

// 5. State form reaktif untuk menampung data payload yang akan dikirimkan ke Laravel
const form = reactive({
  name: '',
  price: 0,
})

// 6. State khusus tampilan visual harga berpemisah ribuan (contoh: "10.000")
const displayPrice = ref('')

// 7. State penanda loading saat tombol simpan ditekan
const isSaving = ref(false)

// 8. State untuk menampung pesan error jika validasi backend gagal
const modalError = ref('')

// 9. Sintaks 'watch': Memantau perubahan nilai props.isOpen secara langsung.
// Setiap kali modal dibuka, form otomatis diisi data terpilih atau dikosongkan.
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      modalError.value = ''
      if (props.product) {
        // Mode Edit: Inisialisasi input dengan data produk yang hendak diedit
        form.name = props.product.name
        form.price = Number(props.product.price)
        displayPrice.value = Number(props.product.price).toLocaleString('id-ID')
      } else {
        // Mode Tambah Baru: Kosongkan seluruh input
        form.name = ''
        form.price = 0
        displayPrice.value = ''
      }
    }
  },
  { immediate: true } // Jalankan watcher segera saat komponen diinisialisasi
)

// 10. Handler pemformatan harga otomatis (10000 -> 10.000)
const handlePriceInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  // Hapus semua karakter yang bukan angka menggunakan Regex
  const rawDigits = target.value.replace(/[^0-9]/g, '')

  if (rawDigits) {
    // Simpan integer murni ke form.price agar valid di backend Laravel ('numeric')
    form.price = parseInt(rawDigits, 10)
    // Tampilkan format bertitik ribuan Indonesia di layar pengguna (contoh: "10.000")
    displayPrice.value = Number(rawDigits).toLocaleString('id-ID')
  } else {
    form.price = 0
    displayPrice.value = ''
  }
}

// ----------------------------------------------------------------------------------------
// ALUR FITUR: SIMPAN DATA (CREATE / UPDATE)
// ----------------------------------------------------------------------------------------
const handleSave = async () => {
  modalError.value = ''
  isSaving.value = true

  try {
    if (isEditing.value && props.product?.id) {
      // 1. Jika Mode Edit: Kirim request HTTP PUT ke endpoint /api/products/{id}
      await $api(`/products/${props.product.id}`, {
        method: 'PUT',
        body: form,
      })
      // 2. Tampilkan notifikasi Toast HIJAU bahwa data berhasil diperbarui
      toast.success('Data produk berhasil diperbarui!')
    } else {
      // 1. Jika Mode Tambah: Kirim request HTTP POST ke endpoint /api/products
      await $api('/products', {
        method: 'POST',
        body: form,
      })
      // 2. Tampilkan notifikasi Toast HIJAU bahwa produk baru berhasil ditambahkan
      toast.success('Produk baru berhasil ditambahkan!')
    }

    // 3. Beri tahu index.vue bahwa data berhasil disimpan agar tabel di-refresh
    emit('saved')
    // 4. Tutup modal pop-out
    emit('close')
  } catch (err: any) {
    // 5. Tangkap pesan error dari validasi Laravel (ApiResponse trait)
    const errorMsg = err?.data?.message || 'Gagal menyimpan data produk.'
    modalError.value = errorMsg
    toast.error(errorMsg)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <!-- Teleport to body: Komponen sakti Vue 3 yang memindahkan seluruh elemen modal langsung ke tag <body>,
       sehingga posisinya benar-benar melayang di atas semua elemen dan tidak terpotong oleh overflow/z-index parent -->
  <Teleport to="body">
    <!-- Transition: Animasi transisi zoom-in dan fade saat modal pop-out muncul -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <!-- Backdrop Overlay Layar Penuh: fixed inset-0 (memenuhi seluruh layar), z-50 (lapisan tertinggi), bg-slate-900/60 (latar hitam transparan 60%), backdrop-blur-sm (efek kaca buram halus) -->
      <!-- @click.self="$emit('close')": Menutup modal secara otomatis saat pengguna mengklik area luar modal (backdrop), persis seperti Bootstrap modal -->
      <div
        v-if="isOpen"
        @click.self="$emit('close')"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      >
        <!-- Kartu Pop-Out Modal: max-w-lg (lebar maksimal 512px) | bg-white (latar kartu putih pekat) | rounded-2xl (sudut membulat modern) | shadow-2xl (bayangan pop-out tebal) | border border-slate-100 (garis tepi lembut) -->
        <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          
          <!-- Header Modal: flex justify-between items-center (judul di kiri, tombol silang X di kanan) | px-6 py-5 (padding dalam) | border-b (garis pemisah bawah) -->
          <div class="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div>
              <!-- Judul Modal berubah dinamis sesuai nilai computed isEditing -->
              <h3 class="text-lg font-bold text-slate-900">
                {{ isEditing ? 'Edit Informasi Produk' : 'Tambah Produk Baru' }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ isEditing ? 'Perbarui data nama dan harga produk di bawah ini.' : 'Masukkan nama dan harga untuk membuat produk baru.' }}
              </p>
            </div>

            <!-- Tombol Silang (X) Penutup Modal -->
            <button
              type="button"
              @click="$emit('close')"
              class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition duration-150 cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body Form Input Modal: @submit.prevent mencegah reload halaman -->
          <!-- p-6 space-y-4: Padding dalam 1.5rem dan jarak vertikal 1rem antar-input -->
          <form @submit.prevent="handleSave" class="p-6 space-y-4">
            
            <!-- Alert Pesan Error Validasi Modal -->
            <div v-if="modalError" class="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ modalError }}</span>
            </div>

            <!-- Input Field: Nama Produk -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Produk <span class="text-rose-500">*</span>
              </label>
              <!-- w-full (lebar 100%) | px-4 py-2.5 (padding input) | border border-slate-300 | rounded-xl (sudut membulat) | focus:ring-2 focus:ring-indigo-500 (glow biru saat aktif) -->
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Contoh: Kopi Robusta Premium"
                class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
              />
            </div>

            <!-- Input Field: Harga Satuan dengan Format Titik Ribuan Otomatis -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Harga Satuan (Rupiah) <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <!-- Label prefix "Rp" tetap di kiri dalam input -->
                <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-semibold text-slate-400 pointer-events-none">
                  Rp
                </span>
                <!-- :value="displayPrice": Menampilkan visual titik ribuan (contoh: "10.000") -->
                <!-- @input="handlePriceInput": Memformat angka otomatis dan menyimpan integer murni di form.price -->
                <!-- pl-11: Padding kiri 2.75rem agar teks angka tidak bertumpuk dengan prefix "Rp" -->
                <input
                  :value="displayPrice"
                  @input="handlePriceInput"
                  type="text"
                  inputmode="numeric"
                  required
                  placeholder="Contoh: 25.000"
                  class="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                />
              </div>
            </div>

            <!-- Footer Modal: Tombol Aksi Batal dan Simpan -->
            <!-- flex justify-end gap-3: Menata tombol di kanan dengan jarak 0.75rem | pt-4 border-t (garis batas pemisah atas) -->
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                @click="$emit('close')"
                class="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition duration-150 cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                :disabled="isSaving"
                class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span v-if="isSaving" class="inline-flex items-center gap-1.5">
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Menyimpan...
                </span>
                <span v-else>
                  {{ isEditing ? 'Perbarui Produk' : 'Simpan Produk' }}
                </span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>
