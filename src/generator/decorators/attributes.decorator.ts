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

  extraAttributes: Record<string, Attribute[]> = {
    DateRangePicker: [
      {
        name: 'helper-text',
        description: 'Add the `helper-text` to add some helper text below the date range picker.',
        type: {
          text: 'string | undefined'
        }
      },
      {
        name: 'disabled',
        description: 'Add the disabled attribute to disable the date range picker.',
        type: {
          text: 'boolean'
        }
      },
      {
        type: {
          text: "string"
        },
        name: 'max',
        description: "The earliest accepted date of the date-picker.",
        default: "''",
        fieldName: "max",
        inheritedFrom: {
          name: "DatePickerBase",
          module: "libs/components/src/shared/date-picker/date-picker-base.ts"
        }
      }
    ],
    Switch: [
      {
        name: 'current-checked',
        description: 'The current checked state of the switch.',
        type: { text: 'boolean' },
      }
    ],
    TextArea: [
      {
        name: 'current-value',
        description: 'The current value of the text-area.',
        type: { text: 'string' },
      },
      {
        name: "placeholder",
        fieldName: "placeholder",
        description: 'Add a placeholder attribute to add placeholder text to the text area.',
        type: {
          text: "string | undefined"
        }
      }
    ]
  }

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
      ...(this.extraAttributes[this.className] ?? [])
    ]
}