import { StyleDescriptor, VividAppConfiguration } from './types'
import { tagPrefix } from './generated/consts'
import coreStyles from './generated/style.core.all'
import darkThemeStyles from './generated/style.theme.dark'
import lightThemeStyles from './generated/style.theme.light'

export * from './generated/consts'
export * from './generated/types'
export * from './types'

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
  container?.classList.add('vvd-root')
}