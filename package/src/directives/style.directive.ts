import { Directive, CSSProperties } from 'vue'
import { vividDataAttributePrefix } from '../types'
import { appendStyle } from '../dom.utils'
import { DirectiveDescriptor } from './types'
import { styleDirectiveName } from './../generated/consts'

const dataVividId = `${vividDataAttributePrefix}-id`

const styleToCssText = (stylesObject: CSSProperties) =>
  Object.entries(stylesObject).map(([key, value]) => `  ${key}: ${value}`).join('\n')

/**
 * Directive facilitates the configuration of inline styles for particular cssPart of a Vivid element
 * w/o having to specify vivid custom element tagName in the css rules, since tag name contains a **dynamic** prefix
 * it's not reliable to be **statically** referenced from css
 *
 * @example
 *   <VwcHeader v-style.base="{ 'background-color': 'red' }" />
 *   <!-- Where, `base` is the name of the cssPart supported by the `VwcHeader` vivid element -->
 */
const styleDirective: Directive<HTMLElement, CSSProperties> = {
  beforeMount(el, { modifiers, value }) {
    const tagName = el.tagName.toLowerCase()
    const vividElementInstanceId = `${Math.random().toString(36).substring(2, 10)}`
    const identity = `${dataVividId}-${vividElementInstanceId}`
    el.setAttribute(identity, '')
    Object.entries(modifiers).forEach(
      ([key, _]) => {
        appendStyle(
          {
            id: `${vividElementInstanceId}`,
            css: `${`${tagName}[${identity}]::part(${key})`} {\n${styleToCssText(value)}\n}`
          }
        )
      }
    )
  }
}

export const styleDirectiveDescriptor = <DirectiveDescriptor>{
  directive: styleDirective,
  name: styleDirectiveName
}