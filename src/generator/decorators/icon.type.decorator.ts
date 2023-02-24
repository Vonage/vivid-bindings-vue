import { ClassField } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { AbstractClassDeclarationDecorator, IClassPropertiesDecorator, IImportsProviderDecorator } from "./types.ts"

/**
 * Replaces icon property as of type `string` by type `IconId`
 */
export class IconTypeDecorator extends AbstractClassDeclarationDecorator implements
  IImportsProviderDecorator,
  IClassPropertiesDecorator {

  static typeName = 'IconId'

  get isIconClass() {
    return this.classDeclaration!.name === 'Icon'
  }

  get isAvatarClass() {
    return this.classDeclaration!.name === 'Avatar'
  }

  get isCardClass() {
    return this.classDeclaration!.name === 'Card'
  }

  get isTargetClass() {
    return this.isIconClass || this.isAvatarClass || this.isCardClass
  }

  decorateProperties(properties: ClassField[]): ClassField[] {
    return properties.map(
      (prop: ClassField) => {
        if (prop.type &&
          (
            (this.isIconClass && prop.name === 'name') ||
            (this.isAvatarClass && prop.name === 'icon') ||
            (this.isCardClass && prop.name === 'icon')
          )
        ) {
          prop.type.text = IconTypeDecorator.typeName
        }
        return prop
      }
    )
  }

  get imports(): string[] {
    if (this.isTargetClass) {
      return [
        `import { ${IconTypeDecorator.typeName} } from '../../src/generated/types'` // TODO: repoint to `npmPackageName` when at least one package version published
      ]
    }
    return []
  }
}