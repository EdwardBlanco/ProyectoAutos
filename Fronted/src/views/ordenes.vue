<template>
  <q-page class="q-pa-lg">
    <div class="page-shell">
      <PageHeader title="Órdenes de trabajo" subtitle="Seguimiento de diagnósticos y reparaciones">
        <template #actions>
          <q-btn unelevated color="primary" label="Nueva orden" icon="add" no-caps />
        </template>
      </PageHeader>

      <div class="surface">
        <div class="q-pa-md">
          <q-input v-model="filtro" dense outlined placeholder="Buscar por orden, placa o cliente" color="primary">
            <template #prepend><q-icon name="search" color="grey-6" /></template>
          </q-input>
        </div>
        <q-table
          class="app-table"
          flat
          :rows="filtradas"
          :columns="columns"
          row-key="id"
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
        >
          <template #body-cell-estado="props">
            <q-td :props="props">
              <StatusChip :estado="props.row.estado" />
            </q-td>
          </template>
          <template #no-data>
            <div class="full-width q-pa-lg text-center empty-copy">No hay órdenes que coincidan.</div>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import StatusChip from '../components/StatusChip.vue'
import { ordenes } from '../data/mock.js'

const filtro = ref('')

const columns = [
  { name: 'id', label: 'Orden', field: 'id', align: 'left' },
  { name: 'placa', label: 'Placa', field: 'placa', align: 'left' },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' }
]

const filtradas = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return ordenes
  return ordenes.filter((o) => `${o.id} ${o.placa} ${o.cliente}`.toLowerCase().includes(q))
})
</script>
