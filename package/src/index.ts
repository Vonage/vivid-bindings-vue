import { StyleDescriptor, VividAppConfiguration } from './types'
import { tagPrefix } from './generated/consts'
import coreStyles from './generated/style.core.all'
import darkThemeStyles from './generated/style.theme.dark'
import lightThemeStyles from './generated/style.theme.light'
import fontSpeziaStyles from './style.font.spezia'

export * from './generated/consts'
export * from './generated/types'
export * from './types'

const appendLinkElement = (document: Document) => (rel: string, href: string, crossOrigin: boolean = false) => {
  const styleElement = document.createElement('link')
  styleElement.setAttribute('rel', rel)
  styleElement.setAttribute('href', href)
  if (crossOrigin) {
    styleElement.setAttribute('crossorigin', '')
  }
  document.head.append(styleElement)
}

const appendStyleElement = (document: Document) => (styleDescriptor: StyleDescriptor) => {
  const styleElement = document.createElement('style')
  styleElement.setAttribute('type', 'text/css')
  styleElement.setAttribute('data-vivid-id', styleDescriptor.id)
  styleElement.innerHTML = styleDescriptor.css
  document.head.append(styleElement)
}

export const isCustomElement = (tag: string) => tag.startsWith(`${tagPrefix}-`)

export const initVivid = (config: VividAppConfiguration) => {
  console.log('initVivid', config)
  const theme = config.theme ?? 'light'
  const font = config.font ?? 'oss'
  const container = config.app._container
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
}