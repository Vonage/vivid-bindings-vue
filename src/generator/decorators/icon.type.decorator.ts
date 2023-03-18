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
    'Button', 'Dialog', 'Badge', 'TextAnchor',
    'Avatar', 'Card', 'AccordionItem',
    'Option', 'Note', 'TextField',
    'NavDisclosure',
    'NavItem', 'MenuItem']

  get isIconClass() {
    return this.className === 'Icon'
  }

  get iconDescriptors() {
    return (icons as Record<string, unknown>).default as IconDescriptor[]
  }

  get isIconCapableClass() {
    return this.iconCapableClasses.includes(this.className)
  }

  get isTargetClass() {
    return this.isIconClass || this.isIconCapableClass
  }

  get typeDescription() {
    return `Icon id. One of ${this.iconDescriptors.length} icons. Catalog with preview/search can be found at https://icons.vivid.vonage.com`
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
        prop.description = this.typeDescription
      }
      return prop
    }
  )

  get imports(): string[] {
    if (this.isTargetClass) {
      return [
        `import { ${IconTypeDecorator.typeName} } from '../../src/generated/types'`
      ]
    }
    return []
  }

  get typeDeclarations(): TypeDeclaration[] {
    return [
      {
        name: IconTypeDecorator.typeName,
        description: this.typeDescription,
        declaration: { text:`${this.iconDescriptors.map(({ id }) => `'${id}'`).join('\n | ')}` }
      }
    ]
  }
}