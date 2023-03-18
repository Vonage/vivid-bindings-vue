import { ClassMethod } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  IMethodsDecorator,
  InlineClassMethod
} from "./types.ts"

/**
 * Takes only Public methods
 */
export class PublicMethodsDecorator extends AbstractClassDeclarationDecorator implements
  IMethodsDecorator {

  defaultMethods = [
    <InlineClassMethod>{
      name: 'getTagName',
      body: `'${this.tagName}'`,
      description: 'Provides underlying Vivid custom element tag name'
    }
  ]

  decorateMethods = (methods: ClassMethod[]) =>
    this.defaultMethods.concat(methods.filter(
      (member) => member.kind === 'method' && !member.name.startsWith('#') &&
        (member.privacy ?? 'public') === 'public'))
}