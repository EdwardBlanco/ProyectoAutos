<template>
  <q-layout>
    <q-page-container>
      <!-- Se añade la clase 'login-bg' para aplicar la imagen de fondo y el degradado -->
      <q-page class="flex flex-center login-bg">
        <q-card style="width: 420px; max-width: 92vw; border-radius: 16px; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6)">
          <q-card-section class="text-center q-pt-xl q-pb-md">
            <div class="row items-center justify-center q-mb-sm">
              <q-avatar color="primary" text-color="white" icon="build" size="48px" class="q-mr-sm shadow-2" />
            </div>
            <div class="text-h5 text-weight-bolder text-primary">Taller Autos</div>
            <div class="text-subtitle2 text-grey-7 q-mt-xs">Inicia sesión en tu cuenta para continuar</div>
          </q-card-section>

          <q-card-section class="q-px-lg q-pb-xl">
            <q-form @submit.prevent="onSubmit" class="q-gutter-y-md">
              <q-input
                v-model.trim="email"
                type="email"
                label="Correo electrónico"
                outlined
                dense
                lazy-rules
                :rules="[val => !!val || 'El correo es requerido']"
                autocomplete="username email"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="grey-6" />
                </template>
              </q-input>

              <q-input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                label="Contraseña"
                outlined
                dense
                lazy-rules
                :rules="[val => !!val || 'La contraseña es requerida']"
                autocomplete="current-password"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="grey-6" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    color="grey-6"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <div class="q-pt-sm">
                <q-btn
                  label="Iniciar Sesión"
                  type="submit"
                  color="primary"
                  unelevated
                  class="full-width text-weight-bold"
                  style="border-radius: 8px; height: 44px;"
                  :loading="loading"
                  no-caps
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const router = useRouter()
const $q = useQuasar()

const onSubmit = async () => {
  if (loading.value) return
  if (!email.value || !password.value) {
    $q.notify({ type: 'warning', message: 'Por favor completa correo y contraseña' })
    return
  }

  loading.value = true
  try {
    const res = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })
    
    // Save token using Pinia
    const authStore = useAuthStore()
    authStore.setToken(res.data.token)
    
    $q.notify({ type: 'positive', message: 'Sesión iniciada exitosamente' })
    await router.replace('/dashboard')
  } catch (error) {
    console.error('Error in login:', error)
    const msg = error.response?.data?.message || 'Credenciales inválidas'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  background: linear-gradient(
      rgba(0, 0, 0, 0.75), 
      rgba(0, 0, 0, 0.75)
    ),
    url('@/assets/muscular-car-service-worker-repairing-vehicle.jpg'); 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>