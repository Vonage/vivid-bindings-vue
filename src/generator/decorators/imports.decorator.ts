import { ClassField } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { getElementRegistrationFunctionName } from '../custom.elements.ts'
import {
  AbstractClassDeclarationDecorator,
  IImportsProviderDecorator,
  IPropertiesDecorator
} from "./types.ts"

/**
 * Provides aggregated import statements
 */
export class ImportsDecorator extends AbstractClassDeclarationDecorator implements
  IPropertiesDecorator,
  IImportsProviderDecorator {

  protected propertiesReferencedTypes: string[] = []

  get vividExportedTypes(): string[] {
    return [
      getElementRegistrationFunctionName(this.classLike!),
      ...this.propertiesReferencedTypes
    ]
  }

  get imports(): string[] {
    return [
      `import { ${this.vividExportedTypes.join(', ')} } from '@vonage/vivid'`
    ]
  }

  decorateProperties = (properties: ClassField[]) => {
    this.propertiesReferencedTypes = properties
      .filter(({ type }) => type)
      .map(({ type }) => type!.text.split('|').map(x => x.trim()))
      .reduce((types, targetTypes) => [...types, ...targetTypes.filter(x => this.isVividExportedType(x))], [])
    return properties
  }

  protected isVividExportedType(typeName: string): boolean {
    return this.vividIndexJs.indexOf(`as ${typeName}`) > 0
  }
}