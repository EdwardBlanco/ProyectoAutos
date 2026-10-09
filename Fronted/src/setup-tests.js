import { config } from '@vue/test-utils'

// Evitar advertencias de componentes globales o directivas no mockeadas si hiciera falta
config.global.stubs = {
  'router-link': true,
  'router-view': true
}

// Mock necesario para el componente Quasar Screen / Orientation en jsdom
if (typeof window !== 'undefined') {
  window.screen = window.screen || {};
  window.screen.orientation = {
    type: 'landscape-primary',
    addEventListener: function() {},
    removeEventListener: function() {}
  };
}
