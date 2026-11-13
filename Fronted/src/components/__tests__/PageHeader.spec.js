import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { Quasar, QAvatar, QBadge } from 'quasar'
import PageHeader from '../PageHeader.vue'

describe('PageHeader.vue', () => {
  const mountHeader = (props = {}, slots = {}) => {
    return mount(PageHeader, {
      props: {
        title: 'Directorio de Clientes',
        ...props
      },
      slots,
      global: {
        plugins: [Quasar],
        components: { QAvatar, QBadge }
      }
    })
  }

  it('renderiza el título y subtítulo correctamente', () => {
    const wrapper = mountHeader({
      title: 'Parque Vehicular',
      subtitle: 'Gestión y control de flota'
    })

    expect(wrapper.text()).toContain('Parque Vehicular')
    expect(wrapper.text()).toContain('Gestión y control de flota')
  })

  it('muestra el avatar con el icono asignado', () => {
    const wrapper = mountHeader({
      icon: 'directions_car',
      iconBg: 'red-1',
      iconColor: 'primary'
    })

    const avatar = wrapper.findComponent(QAvatar)
    expect(avatar.exists()).toBe(true)
    expect(avatar.props('icon')).toBe('directions_car')
  })

  it('renderiza el badge con el conteo numérico o texto', () => {
    const wrapper = mountHeader({
      badge: '15 Registrados'
    })

    const badge = wrapper.findComponent(QBadge)
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toContain('15 Registrados')
  })

  it('renderiza los slots personalizados de acciones', () => {
    const wrapper = mountHeader({}, {
      actions: '<button class="test-action-btn">Nuevo Registro</button>'
    })

    expect(wrapper.find('.test-action-btn').exists()).toBe(true)
    expect(wrapper.find('.test-action-btn').text()).toBe('Nuevo Registro')
  })
})

