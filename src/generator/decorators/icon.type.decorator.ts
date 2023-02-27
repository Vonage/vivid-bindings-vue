import * as icons from 'https://icon.resources.vonage.com/latest' assert { type: "json" }
import { ClassField } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  IPropertiesDecorator,
  IImportsProviderDecorator,
  ITypeDeclarationsProviderDecorator,
  TypeDeclaration
} from "./types.ts"

interface IconDescriptor {
  id: string
}

/**
 * Replaces icon property as of type `string` by type `IconId`
 */
export class IconTypeDecorator extends AbstractClassDeclarationDecorator implements
  ITypeDeclarationsProviderDecorator,
  IImportsProviderDecorator,
  IPropertiesDecorator {

  static typeName = 'IconId'

  get isIconClass() {
    return this.classLike!.name === 'Icon'
  }

  get isDialogClass() {
    return this.classLike!.name === 'Dialog'
  }

  get isAvatarClass() {
    return this.classLike!.name === 'Avatar'
  }

  get isCardClass() {
    return this.classLike!.name === 'Card'
  }

  get isTargetClass() {
    return this.isIconClass || this.isAvatarClass || this.isCardClass || this.isDialogClass
  }

  decorateProperties = (properties: ClassField[]) => properties.map(
    (prop: ClassField) => {
      if (prop.type &&
        (
          (this.isIconClass && prop.name === 'name') ||
          (this.isAvatarClass && prop.name === 'icon') ||
          (this.isDialogClass && prop.name === 'icon') ||
          (this.isCardClass && prop.name === 'icon')
        )
      ) {
        prop.type.text = IconTypeDecorator.typeName
      }
      return prop
    }
  )

  get imports(): string[] {
    if (this.isTargetClass) {
      return [
        `import { ${IconTypeDecorator.typeName} } from '../../src/generated/types'` // TODO: repoint to `npmPackageName` when at least one package version published
      ]
    }
    return []
  }

  get typeDeclarations(): TypeDeclaration[] {
    return [
      {
        name: IconTypeDecorator.typeName,
        declaration: `${((icons as Record<string, unknown>).default as IconDescriptor[]).map(({ id }) => `'${id}'`).join('\n | ')}`
      }
    ]
  }
}