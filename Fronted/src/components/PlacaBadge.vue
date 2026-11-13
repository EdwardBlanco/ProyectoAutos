<template>
  <div class="placa-badge-wrapper inline-flex items-center" :class="[
    `placa--${variant}`,
    `placa--${size}`,
    { 'cursor-pointer': copyable || clickable, 'hover-scale-sm': copyable || clickable }
  ]" @click="handleClick">
    <span class="placa-text">{{ displayPlaca }}</span>

    <q-icon v-if="copyable" name="content_copy" class="q-ml-xs copy-icon opacity-60" :size="iconSize" />

    <q-tooltip v-if="copyable && !copied">
      {{ tooltipText }}
    </q-tooltip>
    <q-tooltip v-if="copyable && copied" v-model="copiedTooltip">
      ¡Copiado!
    </q-tooltip>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  placa: {
    type: String,
    default: 'N/A'
  },
  variant: {
    type: String,
    default: 'standard', // 'standard' | 'pro' | 'outline'
    validator: val => ['standard', 'pro', 'outline'].includes(val)
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md' | 'lg'
    validator: val => ['sm', 'md', 'lg'].includes(val)
  },
  copyable: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  },
  tooltipText: {
    type: String,
    default: 'Clic para copiar placa'
  }
})

const emit = defineEmits(['click', 'copy'])
const $q = useQuasar()
const copied = ref(false)
const copiedTooltip = ref(false)

const displayPlaca = computed(() => {
  if (!props.placa) return 'N/A'
  return String(props.placa).trim().toUpperCase()
})

const iconSize = computed(() => {
  if (props.size === 'sm') return '10px'
  if (props.size === 'lg') return '14px'
  return '12px'
})

async function handleClick(event) {
  if (props.clickable) {
    emit('click', props.placa, event)
  }

  if (props.copyable && props.placa && props.placa !== 'N/A') {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(displayPlaca.value)
      }
      copied.value = true
      copiedTooltip.value = true
      emit('copy', displayPlaca.value)

      if ($q?.notify) {
        $q.notify({
          type: 'positive',
          message: `Placa ${displayPlaca.value} copiada`,
          timeout: 1500,
          position: 'bottom-right'
        })
      }

      setTimeout(() => {
        copied.value = false
        copiedTooltip.value = false
      }, 1800)
    } catch {
      // Fallback en caso de que no tenga permisos de portapapeles
    }
  }
}
</script>

<style scoped>
.placa-badge-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-weight: 800;
  white-space: nowrap;
  user-select: none;
  transition: all 0.15s ease-in-out;
}

/* Variantes */
.placa--standard {
  background: #f1bc0e;
  color: #070707;
  border-radius: 4px;
  letter-spacing: 1.2px;
}


/* Tamaños */
.placa--sm {
  font-size: 11px;
  padding: 1px 6px;
}

.placa--md {
  font-size: 12px;
  padding: 2px 8px;
}

.placa--lg {
  font-size: 15px;
  padding: 4px 12px;
}

/* Interacciones */
.hover-scale-sm:hover {
  transform: translateY(-1px);
  filter: brightness(1.15);
}
</style>
