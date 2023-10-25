import { Attribute, ClassMethod } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  IMethodsDecorator,
  IAttributesDecorator,
} from "./types.ts"

/**
 * Inlines type defintions for attributes and method arguments of type `anchorType` or `AnchorType`,
 * as those type aliases are not exported by vivid.
 */
export class AnchorTypeDecorator extends AbstractClassDeclarationDecorator implements
  IMethodsDecorator,
  IAttributesDecorator {

  decorateAttributes = (attributes: Attribute[]) => {
    for (const p of attributes) {
      this.replaceAnchorType(p)
    }
    return attributes
  }

  decorateMethods(methods: ClassMethod[]): ClassMethod[] {
    for (const p of methods.flatMap(m => m.parameters ?? [])) {
      this.replaceAnchorType(p)
    }
    return methods
  }

  replaceAnchorType = (property: Attribute) => {
    if (property.type?.text) {
      property.type.text = property.type.text.replace(/\b[Aa]nchorType\b/g, 'string | HTMLElement')
    }
  }
}