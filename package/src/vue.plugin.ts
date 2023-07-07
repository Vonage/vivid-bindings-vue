import { App, Plugin } from 'vue'
import { VividConfiguration, vividDataAttributePrefix, vividRootClassName } from './types'
import coreStyles from './generated/style.core.all'
import darkThemeStyles from './generated/style.theme.dark'
import lightThemeStyles from './generated/style.theme.light'
import fontSpeziaStyles from './style.font.spezia'
import { directives } from './directives'
import { vividVersion } from './generated/consts'
import { appendLink, appendStyle, initDomUtils } from './dom.utils'

/**
 * Inits Vivid3 integration with VueJs3 App
 * @param options Provides initial Vivid config, font, theme, etc.
 * @example
import { createApp } from 'vue'
import App from './App.vue'
import { vivid3 } from '@vonage/vivid-bindings-vue'

const app = createApp(App)
app.use(vivid3, {
  font: 'oss',
  theme: 'dark'
})
app.mount('#app')
 */
export const vivid3 = <Plugin>{
  install(app: App<any>, options: VividConfiguration) {
    initDomUtils(window.document)
    directives.forEach(({ name, directive }) => app.directive(name, directive))
    const handle = setInterval(() => {
      const appContainer: HTMLElement = app._container
      if (!appContainer) {
        return
      }
      initDomUtils(appContainer.ownerDocument ?? window.document)
      clearInterval(handle)
      if (options.verbose) {
        console.log('initVivid', options)
      }
      const theme = options.theme ?? 'light'
      const font = options.font ?? 'oss'
      appendStyle(coreStyles)
      appendStyle(theme === 'light' ? lightThemeStyles : darkThemeStyles)
      if (font === 'proprietary') {
        appendStyle(fontSpeziaStyles)
      } else {
        appendLink('preconnect', 'https://fonts.googleapis.com')
        appendLink('preconnect', 'https://fonts.gstatic.com', true)
        appendLink('stylesheet', 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap')
      }
      appContainer.classList.add(vividRootClassName)
      appContainer.setAttribute(`${vividDataAttributePrefix}-version`, vividVersion)
    }, 30)
  }
}
