<template>
  <q-card flat bordered class="kpi-card bg-white transition-hover full-height" :style="customStyle">
    <q-card-section class="q-pa-lg">
      <!-- Encabezado de la Tarjeta (Título + Icono/Avatar) -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-subtitle2 text-grey-6 text-uppercase text-weight-bold tracking-wide">
          {{ title }}
        </div>
        <slot name="header-right">
          <q-avatar
            v-if="icon"
            :color="colorLight"
            :text-color="color"
            size="42px"
            class="shadow-1 flex-shrink-0"
          >
            <q-icon :name="icon" size="20px" />
          </q-avatar>
        </slot>
      </div>

      <!-- Valor Principal de la Métrica -->
      <div class="text-weight-bolder text-dark q-mb-xs flex items-center" :class="valueClass">
        <slot name="value">
          <span>{{ value }}</span>
          <q-icon
            v-if="valueIcon"
            :name="valueIcon"
            :color="valueIconColor"
            size="28px"
            class="q-ml-sm"
          />
        </slot>
      </div>

      <!-- Subtexto descriptivo / Variación porcentual / Estado -->
      <div
        v-if="subtext || $slots.subtext"
        class="text-caption text-weight-medium row items-center"
        :class="subtextColor"
      >
        <slot name="subtext">
          <q-icon v-if="subtextIcon" :name="subtextIcon" size="14px" class="q-mr-xs" />
          <span>{{ subtext }}</span>
        </slot>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    default: ''
  },
  valueClass: {
    type: String,
    default: 'text-h3'
  },
  valueIcon: {
    type: String,
    default: ''
  },
  valueIconColor: {
    type: String,
    default: 'warning'
  },
  icon: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'primary'
  },
  colorLight: {
    type: String,
    default: 'blue-1'
  },
  subtext: {
    type: String,
    default: ''
  },
  subtextIcon: {
    type: String,
    default: ''
  },
  subtextColor: {
    type: String,
    default: 'text-grey-6'
  },
  customStyle: {
    type: [String, Object],
    default: 'border-radius: 16px;'
  }
})
</script>

<style scoped>
.kpi-card {
  border-radius: 16px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.transition-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06) !important;
}

.tracking-wide {
  letter-spacing: 0.5px;
}
</style>

