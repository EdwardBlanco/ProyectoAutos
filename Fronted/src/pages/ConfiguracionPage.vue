<template>
  <q-page class="q-pa-lg">
    <div class="page-shell">
      <PageHeader title="Configuración" subtitle="Datos generales del taller" />

      <div class="surface q-pa-lg">
        <q-form class="q-gutter-md" style="max-width: 520px" @submit.prevent="guardar">
          <q-input v-model="form.nombre" outlined dense label="Nombre del taller" color="primary"
                   :rules="[(v) => !!v || 'Campo obligatorio']" />
          <q-input v-model="form.telefono" outlined dense label="Teléfono" color="primary" />
          <q-input v-model="form.correo" outlined dense type="email" label="Correo de contacto" color="primary" />
          <q-select v-model="form.moneda" outlined dense label="Moneda" color="primary"
                    :options="['COP', 'USD', 'EUR']" />
          <q-toggle v-model="form.notificaciones" color="primary" label="Notificar cuando una orden cambie de estado" />

          <div>
            <q-btn type="submit" unelevated color="primary" label="Guardar cambios" no-caps />
          </div>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { reactive } from 'vue'
import { useQuasar } from 'quasar'
import PageHeader from '@/components/PageHeader.vue'

const $q = useQuasar()

const form = reactive({
  nombre: 'Taller Autos',
  telefono: '',
  correo: '',
  moneda: 'COP',
  notificaciones: true
})

function guardar() {
  $q.notify({ type: 'positive', message: 'Configuración guardada', position: 'top' })
}
</script>
