<template>
  <q-page class="q-pa-lg">
    <div class="page-shell">
      <PageHeader title="Vehículos" subtitle="Flota registrada en el taller">
        <template #actions>
          <q-btn unelevated color="primary" label="Registrar vehículo" icon="add" no-caps />
        </template>
      </PageHeader>

      <div class="surface">
        <div class="q-pa-md">
          <q-input v-model="filtro" dense outlined placeholder="Buscar por placa o marca" color="primary">
            <template #prepend><q-icon name="search" color="grey-6" /></template>
          </q-input>
        </div>
        <q-table
          class="app-table"
          flat
          :rows="filtrados"
          :columns="columns"
          row-key="id"
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
        >
          <template #body-cell-cliente="props">
            <q-td :props="props" class="cell-muted">{{ props.row.cliente }}</q-td>
          </template>
          <template #no-data>
            <div class="full-width q-pa-lg text-center empty-copy">No hay vehículos que coincidan.</div>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { vehiculos } from '../data/mock.js'

const filtro = ref('')

const columns = [
  { name: 'placa', label: 'Placa', field: 'placa', align: 'left' },
  { name: 'marca', label: 'Marca', field: 'marca', align: 'left' },
  { name: 'modelo', label: 'Modelo', field: 'modelo', align: 'left' },
  { name: 'anio', label: 'Año', field: 'anio', align: 'left' },
  { name: 'cliente', label: 'Propietario', field: 'cliente', align: 'left' }
]

const filtrados = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return vehiculos
  return vehiculos.filter((v) => `${v.placa} ${v.marca} ${v.modelo}`.toLowerCase().includes(q))
})
</script>
