import { Directive, CSSProperties } from 'vue'
import { v1 } from 'uuid'

const dataVividId = 'data-vivid-id'

const styleToCssText = (stylesObject: CSSProperties) =>
  Object.entries(stylesObject).map(([key, value]) => `  ${key}: ${value}`).join('\n')

const appendStyleElement = (document: Document) => (id: string, selector: string, stylesObject: CSSProperties) => {
  const styleElement = document.createElement('style')
  styleElement.setAttribute('type', 'text/css')
  styleElement.setAttribute(dataVividId, id)
  styleElement.innerHTML = `${selector} {\n${styleToCssText(stylesObject)}\n}`
  document.head.append(styleElement)
}

/**
 * Directive facilitates the configuration of inline styles for particular cssPart of a Vivid element
 * w/o having to specify vivid custom element tagName in the css rules, since tag name contains a dynamic prefix
 * it's not reliable to be statically referenced from css
 *
 * @example
 *   <VwcHeader v-style.base="{ 'background-color': 'red' }" />
 *   <!-- Where, `base` is the name of the cssPart supported by the `VwcHeader` vivid element -->
 */
export const styleDirective: Directive<HTMLElement, CSSProperties> = {
  beforeMount(el, { modifiers, value }) {
    const tagName = el.tagName.toLowerCase()
    const vividElementInstanceId = `${v1().substring(0, 8)}`
    const identity = `${dataVividId}-${vividElementInstanceId}`
    el.setAttribute(identity, '')
    Object.entries(modifiers).forEach(
      ([key, _]) => {
        appendStyleElement(document)(
          `${vividElementInstanceId}`,
          `${tagName}[${identity}]::part(${key})`,
          value
        )
      }
    )
  }
}