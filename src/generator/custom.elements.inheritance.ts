// much of this code was adapted from https://github.com/Vonage/vivid-vue/blob/4b80e55ffe667cde0f5ad8dc35e29292c6cca519/packages/generator/src/generator/customElementDeclarations.ts

import fastFoundationCustomElements from "https://esm.sh/@microsoft/fast-foundation@2/dist/custom-elements.json" assert {
  type: "json",
};
import {
  CustomElement,
  Package,
  Reference,
  Attribute
} from "https://esm.sh/custom-elements-manifest@latest/schema.d.ts";
import { getClassDeclarations } from "./utils.ts";

const fastFoundationClasses = getClassDeclarations(fastFoundationCustomElements as Package) as CustomElement[]

/**
 * Base declaration for all elements.
 * All custom elements extend HTMLElement and thereby inherit all a variety of events and attributes.
 * However, we declare only a meaningful subset of these here.
 */
const BaseElementDeclaration: CustomElement = {
  name: 'HTMLElement',
  attributes: [
    {
      name: 'aria-current',
      description:
        'Indicates the element that represents the current item within a container or set of related elements.',
      type: { text: "'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'" },
    },
  ],
  events: [
    {
      name: 'click',
      description: `Fires when a pointing device button (such as a mouse's primary mouse button) is both pressed and released while the pointer is located inside the element.`,
      type: { text: 'MouseEvent' },
    },
    {
      name: 'focus',
      description: 'Fires when the element receives focus.',
      type: { text: 'FocusEvent' },
    },
    {
      name: 'blur',
      description: 'Fires when the element loses focus.',
      type: { text: 'FocusEvent' },
    },
    {
      name: 'keydown',
      description: 'Fires when a key is pressed.',
      type: { text: 'KeyboardEvent' },
    },
    {
      name: 'keyup',
      description: 'Fires when a key is released.',
      type: { text: 'KeyboardEvent' },
    },
    {
      name: 'input',
      description: 'Fires when the value of an element has been changed.',
      type: { text: 'Event' },
    },
  ],
  customElement: true,
};

/**
 * Form associated classes like FormAssociatedButton are not exported in the manifest.
 * Instead, we need to provide the declaration here, based on the code:
 * https://github.com/microsoft/fast/blob/master/packages/web-components/fast-foundation/src/form-associated/form-associated.ts
 */
const getFastFormAssociatedDeclaration = (className: string): CustomElement => {
  const declaration: CustomElement = {
    name: className,
    attributes: [
      {
        name: 'disabled',
        description:
          "Sets the element's disabled state. A disabled element will not be included during form submission.",
        type: { text: 'boolean' },
      },
      {
        name: 'value',
        description: `The initial value of the form. This value sets the \`value\` property
only when the \`value\` property has not been explicitly set.`,
        type: { text: 'string' },
      },
      {
        name: 'current-value',
        description: `The current value of the element. This property serves as a mechanism
to set the \`value\` property through both property assignment and the
.setAttribute() method. This is useful for setting the field's value
in UI libraries that bind data through the .setAttribute() API
and don't support IDL attribute binding.`,
        type: { text: 'string' },
      },
      {
        name: 'name',
        description: `The name of the element. This element's value will be surfaced during form submission under the provided name.`,
        type: { text: 'string' },
      },
      {
        name: 'required',
        description: `Require the field to be completed prior to form submission.`,
        type: { text: 'boolean' },
      },
    ],
    superclass: {
      name: 'FoundationElement',
    },
    customElement: true,
  };

  // Only checkbox and radio differ from the base class
  if (className === 'FormAssociatedCheckbox' || className === 'FormAssociatedRadio') {
    declaration.attributes!.push(
      {
        name: 'checked',
        description: `Provides the default checkedness of the input element`,
        type: { text: 'boolean' },
      },
      {
        name: 'current-checked',
        description: `The current checkedness of the element. This property serves as a mechanism
to set the \`checked\` property through both property assignment and the
.setAttribute() method. This is useful for setting the field's checkedness
in UI libraries that bind data through the .setAttribute() API
and don't support IDL attribute binding.`,
        type: { text: 'boolean' },
      }
    );
  }

  return declaration;
};

// Inherit items that are not already present in the child
function inheritItems<T>(getName: (item: T) => string, superItems: T[] = [], childItems: T[] = []): T[] {
  return [...superItems.filter(s => !childItems.some(c => getName(s) === getName(c))), ...childItems];
}

const getAttributeName = (attribute: Attribute): string => {
  const name = attribute.name || attribute.fieldName;
  if (!name) {
    throw new Error('Attribute must have a name or a fieldName');
  }
  return name;
};

/**
 * Vivid uses mixins which are not exported in the manifest.
 * Instead, we need to provide the declaration here, based on the code:
 * https://github.com/Vonage/vivid-3/tree/main/libs/components/src/shared/patterns
 */
const VividMixins: Record<string, Attribute[]> = {
  AffixIcon: [
    {
      name: 'icon',
      description: 'A decorative icon the custom element should have.',
      type: { text: 'string' },
    },
  ],
  AffixIconWithTrailing: [
    {
      name: 'icon',
      description: 'A decorative icon the custom element should have.',
      type: { text: 'string' },
    },
    {
      name: 'icon-trailing',
      description: 'Indicates the icon affix alignment.',
      type: { text: 'boolean' },
    },
  ],
  FormElement: [
    {
      name: 'label',
      description: 'The label for the form element.',
      type: { text: 'string' },
    },
  ],
  FormElementHelperText: [
    {
      name: 'helper-text',
      description: 'The helper text for the form element.',
      type: { text: 'string' },
    },
  ],
  FormElementSuccessText: [
    {
      name: 'success-text',
      description: 'The success text for the form element.',
      type: { text: 'string' },
    },
  ],
  FormElementCharCount: [
    {
      name: 'char-count',
      description: 'Whether to show the character count.',
      type: { text: 'boolean' },
    },
  ],
  ErrorText: [
    {
      name: 'error-text',
      description: 'The error text for the form element.',
      type: { text: 'string' },
    },
  ],
  DataGridCellExtension: [
    {
      name: 'columnDefinition',
      description: 'Extends the data grid cell definition to hold more options.',
      type: { text: 'any' },
    },
  ],
  Localized: [],
};

const resolveComponentDeclaration = (reference: Reference): CustomElement | undefined => {
  let declaration: CustomElement | undefined

  if (reference.name.startsWith('FormAssociated')) {
    // Form associated classes (FormAssociatedButton etc.) are not exported in the manifest
    declaration = getFastFormAssociatedDeclaration(reference.name);
  } else if (reference.name === 'FoundationElement') {
    // This is the base class for all elements
    declaration = BaseElementDeclaration;
  } else if (reference.package === '@microsoft/fast-foundation' && reference.name !== 'FoundationElement') {
    // Remove prefixes added by Vivid
    const fastClassName = reference.name.replace(/^(Foundation|Fast)/i, '');
    declaration = fastFoundationClasses.find(c => c.name.toLowerCase() === fastClassName.toLowerCase())
  }

  if (declaration) {
    declaration = addInheritedItems(declaration)
  }

  return declaration
};

const extractMixins = (componentName: string, classDefinitions: string[]): string[] => {
  for (const definition of classDefinitions) {
    const match = definition.match(new RegExp(`export interface ${componentName} extends\\s+((?:\\w+,?\\s*)+)`))
    if (match) {
      return match[1].split(',').map(s => s.trim())
    }
  }

  return []
}

export const addInheritedItems = (declaration: CustomElement, classDefinitions: string[] = []): CustomElement => {
  const superclassDeclaration = declaration.superclass ? resolveComponentDeclaration(declaration.superclass) : undefined

  const mixins = extractMixins(declaration.name, classDefinitions)

  if (superclassDeclaration || mixins.length) {
    // deep clone to avoid mutating input
    declaration = JSON.parse(JSON.stringify(declaration))
  }

  if (superclassDeclaration) {
    // Inherit members, attributes, and events from the superclass
    // Note: we don't inherit slots, as Vivid components often don't implement them
    declaration.members = inheritItems(m => m.name, superclassDeclaration.members, declaration.members);
    declaration.attributes = inheritItems(getAttributeName, superclassDeclaration.attributes, declaration.attributes);
    declaration.events = inheritItems(m => m.name, superclassDeclaration.events, declaration.events);
  }

  for (const mixinName of mixins) {
    if (!(mixinName in VividMixins)) {
      throw new Error(`Unknown mixin ${mixinName}`);
    }
    declaration.attributes = inheritItems(getAttributeName, VividMixins[mixinName], declaration.attributes);
  }

  return declaration
}