import { ClassField } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  IPropertiesDecorator
} from "./types.ts"

type ReadOnlyClassField = ClassField & {
  readonly?: boolean
}

/**
 * Takes only Public and Writable properties
 */
export class PublicPropertiesDecorator extends AbstractClassDeclarationDecorator implements
  IPropertiesDecorator {

  decorateProperties = (properties: ClassField[]) =>
    properties.filter(
      (member) => member.kind === 'field' &&
        (member.privacy ?? 'public') === 'public').filter(
          (member) => member as ReadOnlyClassField ? (member as ReadOnlyClassField).readonly !== true : true
        )
}