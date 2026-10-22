<script setup lang="ts">
// 1. Mendefinisikan tipe props dari komponen induk (index.vue)
interface Props {
  isOpen: boolean
  product?: { id: number; name: string; price: number | string } | null
}

const props = defineProps<Props>()

// 2. Mendefinisikan emit event: 'close' untuk menutup modal, 'saved' saat simpan berhasil
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

// 3. Mengakses helper $api dari Nuxt context dan toast notifikasi
const { $api } = useNuxtApp()
const toast = useToast()

// 4. Computed penanda mode: bernilai true jika mode Edit (ada product.id), false jika Tambah Baru
const isEditing = computed(() => !!props.product?.id)

// 5. State reaktif form data (nama dan harga angka murni untuk backend)
const form = reactive({
  name: '',
  price: 0,
})

// 6. State tampilan harga visual bertitik ribuan (contoh: "10.000")
const displayPrice = ref('')

// 7. State penanda proses loading saat tombol simpan diklik
const isSaving = ref(false)

// 8. State pesan error jika validasi input backend gagal
const modalError = ref('')

// 9. Watcher: menyinkronkan data form setiap kali modal dibuka
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      modalError.value = ''
      if (props.product) {
        // Mode Edit: Inisialisasi input dengan data produk terpilih
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
  { immediate: true }
)

// 10. Handler pemformatan harga otomatis (10000 -> 10.000)
const handlePriceInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const rawDigits = target.value.replace(/[^0-9]/g, '')

  if (rawDigits) {
    // Simpan integer murni ke form.price agar valid di backend
    form.price = parseInt(rawDigits, 10)
    // Tampilkan format bertitik di layar pengguna
    displayPrice.value = Number(rawDigits).toLocaleString('id-ID')
  } else {
    form.price = 0
    displayPrice.value = ''
  }
}

// 11. Fungsi submit: Menangani Create (POST) maupun Update (PUT) dalam satu alur
const handleSave = async () => {
  modalError.value = ''
  isSaving.value = true

  try {
    if (isEditing.value && props.product?.id) {
      // Panggil PUT /api/products/{id} untuk update data
      await $api(`/products/${props.product.id}`, {
        method: 'PUT',
        body: form,
      })
      toast.success('Data produk berhasil diperbarui!')
    } else {
      // Panggil POST /api/products untuk tambah produk baru
      await $api('/products', {
        method: 'POST',
        body: form,
      })
      toast.success('Produk baru berhasil ditambahkan!')
    }

    // Pancarkan event 'saved' agar index.vue memuat ulang tabel produk
    emit('saved')
    // Pancarkan event 'close' untuk menutup modal
    emit('close')
  } catch (err: any) {
    const errorMsg = err?.data?.message || 'Gagal menyimpan data produk.'
    modalError.value = errorMsg
    toast.error(errorMsg)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <!-- Teleport to body: Memindahkan modal ke level teratas DOM persis Bootstrap modal-backdrop -->
  <Teleport to="body">
    <!-- Transition Vue: Animasi zoom-in dan fade saat modal muncul / tertutup -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <!-- Backdrop Gelap: fixed inset-0 (layar penuh), z-50 (lapisan atas), bg-slate-900/60 (hitam transparan), backdrop-blur-sm (blur lembut) -->
      <!-- @click.self="$emit('close')": Menutup modal jika klik di luar area kartu -->
      <div
        v-if="isOpen"
        @click.self="$emit('close')"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      >
        <!-- Kartu Pop-Out Modal: max-w-lg (lebar 512px), bg-white, rounded-2xl (sudut tumpul), shadow-2xl (bayangan tebal) -->
        <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          
          <!-- Header Modal: flex justify-between items-center (judul di kiri, tombol X di kanan) -->
          <div class="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 class="text-lg font-bold text-slate-900">
                {{ isEditing ? 'Edit Informasi Produk' : 'Tambah Produk Baru' }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ isEditing ? 'Perbarui data nama dan harga produk di bawah ini.' : 'Masukkan nama dan harga untuk membuat produk baru.' }}
              </p>
            </div>

            <!-- Tombol X Close Modal -->
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
          <form @submit.prevent="handleSave" class="p-6 space-y-4">
            
            <!-- Alert Pesan Error jika validasi gagal -->
            <div v-if="modalError" class="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ modalError }}</span>
            </div>

            <!-- Input Nama Produk -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Produk <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Contoh: Kopi Robusta Premium"
                class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
              />
            </div>

            <!-- Input Harga Satuan (Otomatis Titik Ribuan 10000 -> 10.000) -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Harga Satuan (Rupiah) <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-semibold text-slate-400 pointer-events-none">
                  Rp
                </span>
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

            <!-- Footer Modal: Tombol Batal & Simpan -->
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
