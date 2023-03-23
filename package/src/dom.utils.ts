import { StyleDescriptor, vividDataAttributePrefix } from './types'

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

let appendStyle: (styleDescriptor: StyleDescriptor) => void
let appendLink: (rel: string, href: string, crossOrigin?: boolean) => void

export { appendStyle, appendLink }

export const initDomUtils = (document: Document) => {
  appendStyle = appendStyleElement(document)
  appendLink = appendLinkElement(document)
}
