import * as icons from 'https://icon.resources.vonage.com/latest' assert { type: "json" }
import { Attribute } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  IAttributesDecorator,
  IImportsProviderDecorator,
  ITypeDeclarationsProviderDecorator,
  TypeDeclaration
} from "./types.ts"
import { kebab2camel, toValidIdentifier } from '../utils.ts'

interface IconDescriptor {
  id: string
}

/**
 * Replaces icon property as of type `string` by type `IconId`
 */
export class IconTypeDecorator extends AbstractClassDeclarationDecorator implements
  ITypeDeclarationsProviderDecorator,
  IImportsProviderDecorator,
  IAttributesDecorator {

  static typeName = 'IconId'
  static enumName = 'Icon'
  iconCapableClasses = ['Tab', 'Fab', 'Banner',
    'Button', 'Dialog', 'Badge', 'TextAnchor',
    'Avatar', 'Card', 'AccordionItem',
    'Option', 'Note', 'TextField', 'Select',
    'NavDisclosure', 'Combobox',
    'NavItem', 'MenuItem', 'NumberField',
    'Tag', 'TreeItem']

  get isIconClass() {
    return this.className === 'Icon'
  }

  get iconDescriptors() {
    return (icons as unknown as Record<string, unknown>).default as IconDescriptor[]
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

  decorateAttributes = (attributes: Attribute[]) => attributes.map(
    (attr) => {
      if (attr.type &&
        (
          (this.isIconClass && attr.name === 'name') ||
          (this.isIconCapableClass && attr.name === 'icon')
        )
      ) {
        attr.type.text = IconTypeDecorator.typeName
        attr.description = this.typeDescription
      }
      return attr
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
        specifier: 'type',
        assignment: '=',
        description: this.typeDescription,
        declaration: { text: `typeof ${IconTypeDecorator.enumName}[keyof typeof ${IconTypeDecorator.enumName}]` }
      },
      {
        name: IconTypeDecorator.enumName,
        specifier: 'enum',
        assignment: '',
        description: this.typeDescription,
        declaration: { text: `{\n${this.iconDescriptors.map(({ id }) => `  ${toValidIdentifier(kebab2camel(id))} = '${id}'`).join(',\n')}\n}` }
      }
    ]
  }
}