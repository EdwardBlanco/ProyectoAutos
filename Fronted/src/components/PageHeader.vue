<template>
  <div class="page-header row items-center justify-between q-mb-md" :class="customClass">
    <div class="row items-center header-left">
      <q-avatar
        v-if="icon"
        size="44px"
        font-size="22px"
        :color="iconBg"
        :text-color="iconColor"
        :icon="icon"
        class="q-mr-md shadow-1 flex-shrink-0"
      />
      <div>
        <div class="row items-center q-gutter-x-sm">
          <h1 class="text-h4 text-weight-bolder q-my-none text-dark tracking-tight">{{ title }}</h1>
          <slot name="badge">
            <q-badge
              v-if="badge !== null && badge !== undefined && badge !== ''"
              :color="badgeColor"
              :text-color="badgeTextColor"
              class="text-weight-bold q-px-sm py-1 page-header-badge"
            >
              {{ badge }}
            </q-badge>
          </slot>
        </div>
        <div v-if="subtitle || $slots.subtitle" class="text-caption text-grey-7 q-mt-xs">
          <slot name="subtitle">{{ subtitle }}</slot>
        </div>
      </div>
    </div>

    <div v-if="$slots.actions" class="row items-center q-gutter-sm header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  iconBg: {
    type: String,
    default: 'red-1'
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  badge: {
    type: [String, Number],
    default: null
  },
  badgeColor: {
    type: String,
    default: 'grey-3'
  },
  badgeTextColor: {
    type: String,
    default: 'grey-8'
  },
  customClass: {
    type: [String, Object, Array],
    default: ''
  }
})
</script>

<style scoped>
.page-header-badge {
  font-size: 12px;
}
.header-left {
  flex-wrap: nowrap;
}
@media (max-width: 599px) {
  .page-header {
    gap: 12px;
  }
}
</style>

