import { Attribute, ClassMethod } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  IMethodsDecorator,
  IAttributesDecorator,
} from "./types.ts"

const replacementsMap = {
  'string | HTMLElement': /\b[Aa]nchorType\b/g,
  'string': /\bTextAreaResize\b/g
}

/**
 * Inlines type defintions for attributes and method arguments as those type aliases are not exported by vivid.
 */
export class NotExportedTypesDecorator extends AbstractClassDeclarationDecorator implements
  IMethodsDecorator,
  IAttributesDecorator {

  decorateAttributes = (attributes: Attribute[]) => {
    for (const p of attributes) {
      this.replaceTypes(p)
    }
    return attributes
  }

  decorateMethods(methods: ClassMethod[]): ClassMethod[] {
    for (const p of methods.flatMap(m => m.parameters ?? [])) {
      this.replaceTypes(p)
    }
    return methods
  }

  replaceTypes = (property: Attribute) => {
    if (!property.type?.text) {
      return
    }
    property.type.text = Object.entries(replacementsMap).reduce((acc: string, item: [string, RegExp]) => {
      const [replacement, regexp] = item
      return acc.replace(regexp, replacement)
    }, property.type.text)
  }
}