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
  iconCapableClasses = ['Tab', 'Fab', 'Banner',
    'Button', 'Dialog', 'Badge',
    'Avatar', 'Card', 'AccordionItem',
    'Option', 'Note', 'TextField',
    'NavDisclosure',
    'NavItem', 'MenuItem']

  get isIconClass() {
    return this.classLike!.name === 'Icon'
  }

  get isIconCapableClass() {
    return this.iconCapableClasses.includes(this.classLike!.name)
  }

  get isTargetClass() {
    return this.isIconClass || this.isIconCapableClass
  }

  decorateProperties = (properties: ClassField[]) => properties.map(
    (prop: ClassField) => {
      if (prop.type &&
        (
          (this.isIconClass && prop.name === 'name') ||
          (this.isIconCapableClass && prop.name === 'icon')
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