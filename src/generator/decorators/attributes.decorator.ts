import { Attribute, Slot } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  IAttributesDecorator,
  ISlotsDecorator
} from "./types.ts"

/**
 * Adds missing attributes declarations, due to incomplete Vivid elements meta data
 * Adds supported Slots documentation on synthetic attribute `supportedSlots`
 */
export class AttributesDecorator extends AbstractClassDeclarationDecorator implements
  ISlotsDecorator,
  IAttributesDecorator {

  styleAttribute: Attribute = {
    name: "style",
    description: 'Default style properties bindable object',
    type: {
      text: "unknown"
    }
  }

  get supportedSlotsAttribute(): Attribute {
    return {
      name: "supportedSlots",
      description: this.supportedSlotsAttributeDescription,
      type: {
        text: "never"
      }
    }
  }

  get hasNonDefaultSlots(): boolean {
    return this.slots.filter(({ name }) => name).length > 0
  }

  get supportedSlotsAttributeDescription(): string {
    return this.slots.filter(({ name }) => name).map(({ name, description }) => `- \`${name}\` - ${description}`).join('\n')
  }

  iconAttribute: Attribute = {
    name: "icon",
    description: 'Indicates which icon to resolve.',
    type: {
      text: "string"
    }
  }

  /**
   * TODO: To address issue to https://custom-elements-manifest.open-wc.org/
   * issue: CEM Analyzer is not catching inherited properties & attributes
   *
   * Mitigation path: Vivid elements has to be documented properly via JsDoc custom tags
   * https://github.com/open-wc/custom-elements-manifest/blob/8f9646c6a84dce20b1b018a61a8d024bae07d8cd/packages/analyzer/src/features/analyse-phase/class-jsdoc.js#L19
   */
  affixIconWithTrailingAttributes: Attribute[] = [
    this.iconAttribute,
    {
      name: "icon-trailing",
      fieldName: "iconTrailing",
      description: 'Indicates the icon affix alignment.',
      type: {
        text: "boolean"
      }
    }
  ]

  extraAttributes: Record<string, Attribute[]> = {
    AccordionItem: [
      ...this.affixIconWithTrailingAttributes
    ],
    Button: [
      ...this.affixIconWithTrailingAttributes
    ],
    Badge: [
      ...this.affixIconWithTrailingAttributes
    ],
    Fab: [
      ...this.affixIconWithTrailingAttributes
    ],
    Tab: [
      ...this.affixIconWithTrailingAttributes
    ],
    Option: [
      ...this.affixIconWithTrailingAttributes
    ],
    TextAnchor: [
      ...this.affixIconWithTrailingAttributes
    ],
    Select: [
      ...this.affixIconWithTrailingAttributes
    ],

    TextField: [
      this.iconAttribute
    ],
    Combobox: [
      this.iconAttribute
    ],
    Banner: [
      this.iconAttribute
    ],
    NavItem: [
      this.iconAttribute
    ],
    MenuItem: [
      this.iconAttribute
    ],
    NavDisclosure: [
      this.iconAttribute
    ],
    Note: [
      this.iconAttribute
    ]
  }

  protected slots: Slot[] = []

  decorateSlots = (slots: Slot[]) => {
    this.slots = slots
    return slots
  }

  decorateAttributes = (attributes: Attribute[]) =>
    [
      ...(this.hasNonDefaultSlots ? [this.supportedSlotsAttribute] : []),
      this.styleAttribute,
      ...attributes,
      ...(this.extraAttributes[this.className] ?? [])
    ]
}