<template>
  <q-page class="q-pa-lg">
    <div class="page-shell">
      <PageHeader title="Clientes" subtitle="Directorio de propietarios">
        <template #actions>
          <q-btn unelevated color="primary" label="Nuevo cliente" icon="add" no-caps />
        </template>
      </PageHeader>

      <div class="surface">
        <div class="q-pa-md">
          <q-input v-model="filtro" dense outlined placeholder="Buscar por nombre o teléfono" color="primary">
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
          <template #body-cell-correo="props">
            <q-td :props="props" class="cell-muted">{{ props.row.correo }}</q-td>
          </template>
          <template #no-data>
            <div class="full-width q-pa-lg text-center empty-copy">No hay clientes que coincidan.</div>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { clientes } from '@/data/mock.js'

const filtro = ref('')

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
  { name: 'correo', label: 'Correo', field: 'correo', align: 'left' },
  { name: 'vehiculos', label: 'Vehículos', field: 'vehiculos', align: 'left' }
]

const filtrados = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return clientes
  return clientes.filter((c) => `${c.nombre} ${c.telefono}`.toLowerCase().includes(q))
})
</script>
