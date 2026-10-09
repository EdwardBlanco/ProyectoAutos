import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import RecepcionWizard from '../RecepcionWizard.vue'
import api from '@/services/api'
import { nextTick } from 'vue'

// Mockear Axios / API
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// Mockear el router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mockear Quasar useQuasar
vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useQuasar: () => ({
      notify: vi.fn()
    })
  }
})

// Wrapper builder para inyectar Quasar
const mountWizard = (props = {}) => {
  return mount(RecepcionWizard, {
    props: {
      modelValue: true, // Forzar a que el modal se muestre
      ...props
    },
    global: {
      plugins: [Quasar]
    }
  })
}

describe('RecepcionWizard.vue - Unit & Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe renderizarse correctamente y abrir en el paso 1 (Cliente)', async () => {
    const wrapper = mountWizard()
    
    // Esperar al ciclo del DOM
    await nextTick()
    
    // Validar que el componente exista
    expect(wrapper.exists()).toBe(true)
    
    // Verificar si el texto del primer paso existe (buscamos en body porque q-dialog hace teleport)
    expect(document.body.innerHTML).toContain('Selecciona o crea un cliente')
  })

  it('debe saltar al paso 3 si se le pasa un prop "prefill" de tipo vehiculo', async () => {
    const prefillData = {
      type: 'vehiculo',
      data: {
        _id: 'veh1',
        placa: 'XYZ-123',
        clienteId: { _id: 'cli1', nombre: 'Eduardo' }
      }
    }

    api.get.mockResolvedValue({ data: [] })
    const wrapper = mountWizard({ prefill: prefillData })
    await nextTick()

    // Como prefill fue vehiculo, el step debería haber cambiado al 3 (Orden)
    expect(wrapper.vm.step).toBe(3)
    // El vehiculo seleccionado debió poblarse
    expect(wrapper.vm.vehiculoSelect._id).toBe('veh1')
    expect(wrapper.vm.clienteSelect._id).toBe('cli1')
    
    expect(document.body.innerHTML).toContain('Detalles de Recepción')
  })

  it('debe completar el wizard llamando a los endpoints correctos (Integration Mock)', async () => {
    const wrapper = mountWizard()
    await nextTick()

    // Mockear respuestas de red para finalizar
    api.post.mockResolvedValueOnce({ data: { _id: 'cli_new' } }) // POST /clientes
    api.post.mockResolvedValueOnce({ data: { _id: 'veh_new' } }) // POST /vehiculos
    api.post.mockResolvedValueOnce({ data: { _id: 'ord_new' } }) // POST /ordenes

    // Mockear que los formularios son válidos simulando el estado manual
    wrapper.vm.step = 3
    wrapper.vm.cliente = { _id: null, nombre: 'Test', cedula: '123' }
    wrapper.vm.vehiculo = { _id: null, placa: 'MOCK', marca: 'Test' }
    wrapper.vm.orden = { descripcionFalla: 'Falla test', mecanicoId: null }
    
    // Stub validation functions (debido a que los refs form no montados del todo fallan)
    wrapper.vm.formOrden = { validate: vi.fn().mockResolvedValue(true) }

    await wrapper.vm.finalizar()

    // Verificaciones
    expect(api.post).toHaveBeenCalledTimes(3)
    expect(api.post).toHaveBeenNthCalledWith(1, '/clientes', expect.objectContaining({ nombre: 'Test' }))
    expect(api.post).toHaveBeenNthCalledWith(2, '/vehiculos', expect.objectContaining({ placa: 'MOCK', clienteId: 'cli_new' }))
    expect(api.post).toHaveBeenNthCalledWith(3, '/ordenes', expect.objectContaining({ descripcionFalla: 'Falla test', vehiculoId: 'veh_new' }))
  })
})
