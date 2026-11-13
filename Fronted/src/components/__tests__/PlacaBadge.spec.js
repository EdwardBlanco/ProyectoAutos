import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Quasar, QIcon, QTooltip } from 'quasar'
import PlacaBadge from '../PlacaBadge.vue'

describe('PlacaBadge.vue', () => {
  const mountBadge = (props = {}) => {
    return mount(PlacaBadge, {
      props: {
        placa: 'abc-123',
        ...props
      },
      global: {
        plugins: [Quasar],
        components: { QIcon, QTooltip }
      }
    })
  }

  it('formatea y muestra la placa en mayúsculas', () => {
    const wrapper = mountBadge({ placa: 'xyz-789' })
    expect(wrapper.find('.placa-text').text()).toBe('XYZ-789')
  })

  it('aplica las clases correspondientes a las variantes standard y pro', async () => {
    const wrapperStandard = mountBadge({ variant: 'standard' })
    expect(wrapperStandard.classes()).toContain('placa--standard')

    const wrapperPro = mountBadge({ variant: 'pro' })
    expect(wrapperPro.classes()).toContain('placa--pro')
  })

  it('muestra "N/A" si la placa está vacía', () => {
    const wrapper = mountBadge({ placa: '' })
    expect(wrapper.find('.placa-text').text()).toBe('N/A')
  })

  it('emite el evento click al interactuar cuando clickable es true', async () => {
    const wrapper = mountBadge({ placa: 'ABC-123', clickable: true })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')[0][0]).toBe('ABC-123')
  })

  it('permite copiar al portapapeles cuando copyable es true', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    })

    const wrapper = mountBadge({ placa: 'ABC-123', copyable: true })
    await wrapper.trigger('click')

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ABC-123')
    expect(wrapper.emitted('copy')).toBeTruthy()
    expect(wrapper.emitted('copy')[0][0]).toBe('ABC-123')
  })
})

