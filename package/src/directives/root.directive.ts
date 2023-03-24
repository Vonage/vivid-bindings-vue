import { Directive } from 'vue'
import { rootDirectiveName } from '../generated/consts'
import { vividRootClassName } from '../types'
import { DirectiveDescriptor } from './types'

/**
 * Directive marks any `HTMLElement` as Vivid root
 *
 * @example
 *   <div v-vivid-root />
 * @example
 *    <Teleport to="body">
 *      <VwcDialog v-vivid-root>
 *        <VwcHeader slot="body">
 *          <div slot="app-content">content</div>
 *        </VwcHeader>
 *      </VwcDialog>
 *    </Teleport>
*/
const rootDirective: Directive<HTMLElement> = {
  beforeMount(el) {
    el?.classList.add(vividRootClassName)
  }
}

export const rootDirectiveDescriptor = <DirectiveDescriptor>{
  directive: rootDirective,
  name: rootDirectiveName
}