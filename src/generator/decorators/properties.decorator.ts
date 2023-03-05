import { ClassField } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  IPropertiesDecorator
} from "./types.ts"

/**
 * Adds missing properties declarations, due to incomplete Vivid elements meta data
 */
export class PropertiesDecorator extends AbstractClassDeclarationDecorator implements
  IPropertiesDecorator {

  slotProperty = <ClassField>{
    kind: "field",
    name: "slot",
    description: 'Indicates the named slot to be injected to',
    type: {
      text: "string"
    }
  }

  iconProperty = <ClassField>{
    kind: "field",
    name: "icon",
    description: 'Indicates which icon to resolve.',
    type: {
      text: "string"
    }
  }

  /**
   * TODO: To address issue to https://custom-elements-manifest.open-wc.org/
   * issue: CEM Analyzer is not catching inherited properties & attributes
   */
  affixIconWithTrailingProperties: ClassField[] = [
    this.iconProperty,
    {
      kind: "field",
      name: "iconTrailing",
      description: 'Indicates the icon affix alignment.',
      type: {
        text: "boolean"
      }
    }
  ]

  extraPropertiesMap: Record<string, ClassField[]> = {
    AccordionItem: [
      ...this.affixIconWithTrailingProperties
    ],
    Button: [
      ...this.affixIconWithTrailingProperties
    ],
    Badge: [
      ...this.affixIconWithTrailingProperties
    ],
    Fab: [
      ...this.affixIconWithTrailingProperties
    ],
    Tab: [
      ...this.affixIconWithTrailingProperties
    ],
    Option: [
      ...this.affixIconWithTrailingProperties
    ],
    TextAnchor: [
      ...this.affixIconWithTrailingProperties
    ],

    TextField: [
      this.iconProperty
    ],
    Banner: [
      this.iconProperty
    ],
    NavItem: [
      this.iconProperty
    ],
    MenuItem: [
      this.iconProperty
    ],
    NavDisclosure: [
      this.iconProperty
    ],
    Note: [
      this.iconProperty
    ]
  }

  decorateProperties = (properties: ClassField[]) =>
    [
      this.slotProperty,
      ...properties,
      ...(this.extraPropertiesMap[this.className] ?? [])
    ]
}