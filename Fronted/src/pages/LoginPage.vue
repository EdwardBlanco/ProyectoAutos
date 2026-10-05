<template>
  <q-page class="flex flex-center" style="background-color: #f8fafc">
    <q-card style="width: 400px; max-width: 90vw; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)">
      <q-card-section class="text-center q-pt-lg">
        <div class="text-h5 text-weight-bold text-primary">Taller Autos</div>
        <div class="text-subtitle2 text-grey-7 q-mt-sm">Inicia sesión para continuar</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="email"
            type="email"
            label="Correo electrónico"
            outlined
            dense
            :rules="[val => !!val || 'El correo es requerido']"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            type="password"
            label="Contraseña"
            outlined
            dense
            :rules="[val => !!val || 'La contraseña es requerida']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>

          <div>
            <q-btn
              label="Iniciar Sesión"
              type="submit"
              color="primary"
              unelevated
              class="full-width"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '@/services/api'

const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()
const $q = useQuasar()

const onSubmit = async () => {
  loading.value = true
  try {
    const res = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })
    
    // Save token
    localStorage.setItem('token', res.data.token)
    
    $q.notify({ type: 'positive', message: 'Sesión iniciada exitosamente' })
    router.push('/dashboard')
  } catch (error) {
    console.error('Error in login:', error)
    $q.notify({ type: 'negative', message: 'Credenciales inválidas' })
  } finally {
    loading.value = false
  }
}
</script>
