import { ClassField, ClassMethod, PropertyLike } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  IMethodsDecorator,
  IPropertiesDecorator,
} from "./types.ts"

/**
 * Inlines type defintions for properties and method arguments of type `anchorType` or `AnchorType`,
 * as those type aliases are not exported by vivid.
 */
export class AnchorTypeDecorator extends AbstractClassDeclarationDecorator implements
  IMethodsDecorator,
  IPropertiesDecorator {

  decorateProperties = (properties: ClassField[]) => {
    for (const p of properties) {
      this.replaceAnchorType(p)
    }
    return properties
  }

  decorateMethods(methods: ClassMethod[]): ClassMethod[] {
    for (const p of methods.flatMap(m => m.parameters ?? [])) {
      this.replaceAnchorType(p)
    }
    return methods
  }

  replaceAnchorType = (property: PropertyLike) => {
    if (property.type?.text) {
      property.type.text = property.type.text.replace(/\b[Aa]nchorType\b/g, 'string | HTMLElement')
    }
  }
}