import { ClassField } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  IPropertiesDecorator
} from "./types.ts"

type ReadOnlyClassField = ClassField & {
  readonly?: boolean
}

/**
 * Takes only Public and Writable and Not Private methods reflected properties/fields
 */
export class PublicPropertiesDecorator extends AbstractClassDeclarationDecorator implements
  IPropertiesDecorator {

  decorateProperties = (properties: ClassField[]) => properties
    .filter(this.isPublicField)
    .filter(this.isWritableField)
    .filter(this.isNotAFieldReflectingPrivateMethod(properties))

  isNotAFieldReflectingPrivateMethod = (properties: ClassField[]) => (classField: ClassField): boolean =>
    !properties.find((member) => member.kind === 'method' && member.name.startsWith(`#${classField.name}`))

  isWritableField = (classField: ClassField): boolean => classField as ReadOnlyClassField ? (classField as ReadOnlyClassField).readonly !== true : true

  isPublicField = (classField: ClassField): boolean =>
    classField.kind === 'field' && !classField.name.startsWith('_') &&
    (classField.privacy ?? 'public') === 'public'
}