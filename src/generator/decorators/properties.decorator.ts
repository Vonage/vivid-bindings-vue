import { ClassField, Slot } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  IPropertiesDecorator,
  ISlotsDecorator
} from "./types.ts"

/**
 * Adds missing properties declarations, due to incomplete Vivid elements meta data
 * Adds supported Slots documentation on synthetic property `supportedSlots`
 */
export class PropertiesDecorator extends AbstractClassDeclarationDecorator implements
  ISlotsDecorator,
  IPropertiesDecorator {

  styleProperty = <ClassField>{
    kind: "field",
    name: "style",
    description: 'Default style properties bindable object',
    type: {
      text: "unknown"
    }
  }

  get supportedSlotsProperty(): ClassField {
    return {
      kind: "field",
      static: true,
      name: "supportedSlots",
      description: this.supportedSlotsPropertyDescription,
      type: {
        text: "never"
      }
    }
  }

  get hasNonDefaultSlots(): boolean {
    return this.slots.filter(({ name }) => name).length > 0
  }

  get supportedSlotsPropertyDescription(): string {
    return this.slots.filter(({ name }) => name).map(({ name, description }) => `- \`${name}\` - ${description}`).join('\n')
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

  protected slots: Slot[] = []

  decorateSlots = (slots: Slot[]) => {
    this.slots = slots
    return slots
  }

  decorateProperties = (properties: ClassField[]) =>
    [
      ...(this.hasNonDefaultSlots ? [this.supportedSlotsProperty] : []),
      this.styleProperty,
      ...properties,
      ...(this.extraPropertiesMap[this.className] ?? [])
    ]
}