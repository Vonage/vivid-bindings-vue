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
    ]
}