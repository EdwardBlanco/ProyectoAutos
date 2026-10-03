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
import { computed, ref, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusChip from '@/components/StatusChip.vue'
import api from '@/services/api'

const filtro = ref('')
const ordenes = ref([])

const columns = [
  { name: 'id', label: 'Orden', field: 'numeroOrden', align: 'left' },
  { name: 'placa', label: 'Placa', field: row => row.vehiculoId?.placa || 'N/A', align: 'left' },
  { name: 'cliente', label: 'Cliente', field: row => row.vehiculoId?.clienteId?.nombre || 'N/A', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: row => new Date(row.fechaIngreso).toLocaleDateString(), align: 'left' }
]

const fetchOrdenes = async () => {
  try {
    const { data } = await api.get('/ordenes')
    ordenes.value = data
  } catch (error) {
    console.error('Error fetching ordenes:', error)
  }
}

onMounted(() => {
  fetchOrdenes()
})

const filtradas = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return ordenes.value
  return ordenes.value.filter((o) => `${o.numeroOrden} ${o.vehiculoId?.placa}`.toLowerCase().includes(q))
})
</script>
