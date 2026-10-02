<template>
  <q-page class="q-pa-lg">
    <div class="page-shell">
      <PageHeader title="Expedientes" subtitle="Historial y documentos por vehículo">
        <template #actions>
          <q-btn unelevated color="primary" label="Nuevo expediente" icon="add" no-caps />
        </template>
      </PageHeader>

      <div class="surface">
        <div class="q-pa-md">
          <q-input v-model="filtro" dense outlined placeholder="Buscar por expediente, cliente o placa" color="primary">
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
          <template #no-data>
            <div class="full-width q-pa-lg text-center empty-copy">No hay expedientes que coincidan.</div>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { expedientes } from '@/data/mock.js'

const filtro = ref('')

const columns = [
  { name: 'id', label: 'Expediente', field: 'id', align: 'left' },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' },
  { name: 'placa', label: 'Placa', field: 'placa', align: 'left' },
  { name: 'documentos', label: 'Documentos', field: 'documentos', align: 'left' },
  { name: 'actualizado', label: 'Actualizado', field: 'actualizado', align: 'left' }
]

const filtrados = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return expedientes
  return expedientes.filter((e) => `${e.id} ${e.cliente} ${e.placa}`.toLowerCase().includes(q))
})
</script>
