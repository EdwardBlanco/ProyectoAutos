import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { Quasar, QCard, QCardSection, QAvatar, QIcon } from 'quasar'
import KpiCard from '../KpiCard.vue'

describe('KpiCard.vue', () => {
  const mountKpi = (props = {}, slots = {}) => {
    return mount(KpiCard, {
      props: {
        title: 'Ingresos Facturados',
        value: '$1,500,000',
        ...props
      },
      slots,
      global: {
        plugins: [Quasar],
        components: { QCard, QCardSection, QAvatar, QIcon }
      }
    })
  }

  it('renderiza el título y valor numérico correctamente', () => {
    const wrapper = mountKpi({
      title: 'Órdenes Activas',
      value: '24'
    })

    expect(wrapper.text()).toContain('Órdenes Activas')
    expect(wrapper.text()).toContain('24')
  })

  it('muestra el avatar con el icono superior cuando se especifica', () => {
    const wrapper = mountKpi({
      icon: 'attach_money',
      color: 'green-8',
      colorLight: 'green-1'
    })

    const avatar = wrapper.findComponent(QAvatar)
    expect(avatar.exists()).toBe(true)
    const icon = avatar.findComponent(QIcon)
    expect(icon.props('name')).toBe('attach_money')
  })

  it('muestra el subtexto y su icono descriptivo', () => {
    const wrapper = mountKpi({
      subtext: 'Últimos 30 días',
      subtextIcon: 'event',
      subtextColor: 'text-green-6'
    })

    expect(wrapper.text()).toContain('Últimos 30 días')
    const subtextEl = wrapper.find('.text-caption')
    expect(subtextEl.classes()).toContain('text-green-6')
  })

  it('renderiza icono adyacente al valor (ej. estrella de calificación)', () => {
    const wrapper = mountKpi({
      value: '4.9',
      valueIcon: 'star',
      valueIconColor: 'warning'
    })

    expect(wrapper.text()).toContain('4.9')
    const icons = wrapper.findAllComponents(QIcon)
    const starIcon = icons.find(i => i.props('name') === 'star')
    expect(starIcon).toBeDefined()
  })

  it('permite personalizar el valor mediante el slot #value', () => {
    const wrapper = mountKpi({}, {
      value: '<span class="custom-badge-value">Custom 99%</span>'
    })

    expect(wrapper.find('.custom-badge-value').exists()).toBe(true)
    expect(wrapper.find('.custom-badge-value').text()).toBe('Custom 99%')
  })
})

