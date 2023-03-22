import { App, Plugin } from 'vue'
import { StyleDescriptor, VividConfiguration, vividDataAttributePrefix } from './types'
import { tagPrefix } from './generated/consts'
import coreStyles from './generated/style.core.all'
import darkThemeStyles from './generated/style.theme.dark'
import lightThemeStyles from './generated/style.theme.light'
import fontSpeziaStyles from './style.font.spezia'
import { styleDirective } from './directives'
import { styleDirectiveName, vividVersion } from './generated/consts'

export * from './generated/consts'
export * from './generated/types'
export * from './types'

const appendLinkElement = (document: Document) => (rel: string, href: string, crossOrigin: boolean = false) => {
  const linkElement = document.createElement('link')
  linkElement.setAttribute('rel', rel)
  linkElement.setAttribute('href', href)
  if (crossOrigin) {
    linkElement.setAttribute('crossorigin', '')
  }
  document.head.append(linkElement)
}
const appendStyleElement = (document: Document) => (styleDescriptor: StyleDescriptor) => {
  const styleElement = document.createElement('style')
  styleElement.setAttribute('type', 'text/css')
  styleElement.setAttribute(`${vividDataAttributePrefix}-id`, styleDescriptor.id)
  styleElement.innerHTML = styleDescriptor.css
  document.head.append(styleElement)
}

/**
 * Vite config helper, to tell Vite which custom elements are Vivid elements
 * @param tag
 * @returns true if the tag IS a Vivid element
 * @example
 vite.config.ts:

 import { isCustomElement } from '@vonage/vivid-bindings-vue'

 ```json
  plugins: [
    vue(
      {
        template: {
          compilerOptions: {
            isCustomElement
          }
        }
      }
    )
  ],
```
 */
export const isCustomElement = (tag: string) => tag.startsWith(`${tagPrefix}-`)

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
    app.directive(styleDirectiveName, styleDirective)
    const handle = setTimeout(() => {
      if (app._container) {
        clearTimeout(handle)
        console.log('initVivid', options)
        const theme = options.theme ?? 'light'
        const font = options.font ?? 'oss'
        const container: HTMLElement = app._container
        const document: Document = container?.ownerDocument ?? window.document
        appendStyleElement(document)(coreStyles)
        appendStyleElement(document)(theme === 'light' ? lightThemeStyles : darkThemeStyles)
        if (font === 'proprietary') {
          appendStyleElement(document)(fontSpeziaStyles)
        } else {
          appendLinkElement(document)('preconnect', 'https://fonts.googleapis.com')
          appendLinkElement(document)('preconnect', 'https://fonts.gstatic.com', true)
          appendLinkElement(document)('stylesheet', 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap')
        }
        container?.classList.add('vvd-root')
        container?.setAttribute(`${vividDataAttributePrefix}-version`, vividVersion)
      }
    }, 0)
  }
}
