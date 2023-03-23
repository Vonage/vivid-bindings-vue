import { tagPrefix } from './generated/consts'

/**
 * Vite config helper, to tell Vite to tell Vue which custom elements are Vivid elements
 * @param tag
 * @returns true if the tag IS a Vivid element
 * @example
 vite.config.ts:

 import { isCustomElement } from '@vonage/vivid-bindings-vue'

 ```
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
