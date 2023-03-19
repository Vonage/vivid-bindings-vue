import { ClassMethod } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  IMethodsDecorator
} from "./types.ts"

/**
 * Takes only Public methods
 */
export class PublicMethodsDecorator extends AbstractClassDeclarationDecorator implements
  IMethodsDecorator {

  decorateMethods = (methods: ClassMethod[]) =>
    methods.filter(
      (member) => member.kind === 'method' && !member.name.startsWith('#') &&
        (member.privacy ?? 'public') === 'public')
}