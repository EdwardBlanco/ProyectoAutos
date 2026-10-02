<template>
  <q-badge
    class="status-chip"
    :color="tone.color"
    :text-color="tone.text"
    :label="estado"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  estado: { type: String, required: true }
})

const map = {
  Diagnóstico: { color: 'blue-1', text: 'blue-9' },
  Reparación: { color: 'orange-1', text: 'orange-10' },
  Listo: { color: 'green-1', text: 'green-9' },
  Entregado: { color: 'grey-3', text: 'grey-8' }
}

const tone = computed(() => map[props.estado] || { color: 'grey-3', text: 'grey-8' })
</script>
