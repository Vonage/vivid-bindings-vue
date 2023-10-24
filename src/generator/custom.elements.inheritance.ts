import fastFoundationCustomElements from "https://esm.sh/@microsoft/fast-foundation@2/dist/custom-elements.json" assert {
  type: "json",
};
import {
  ClassLike,
  Package,
  Reference,
  CustomElementDeclaration,
} from "https://esm.sh/custom-elements-manifest@latest/schema.d.ts";
import { getClassDeclarations } from "./utils.ts";

type Declaration = CustomElementDeclaration & ClassLike;

const fastFoundationClasses = getClassDeclarations(fastFoundationCustomElements as Package) as Declaration[]

/**
 * Base declaration for all elements.
 * All custom elements extend HTMLElement and thereby inherit all a variety of events and attributes.
 * However, we declare only a meaningful subset of these here.
 */
const BaseElementDeclaration: Declaration = {
  name: 'HTMLElement',
  kind: 'class',
  members: [
    {
      kind: "field",
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
const getFastFormAssociatedDeclaration = (className: string): CustomElementDeclaration  => {
  const declaration: Declaration = {
    name: className,
    kind: "class",
    members: [
      {
        kind: "field",
        name: "disabled",
        description:
          "Sets the element's disabled state. A disabled element will not be included during form submission.",
        type: { text: "boolean" },
      },
      {
        kind: "field",
        name: "value",
        description:
          `The initial value of the form. This value sets the \`value\` property
only when the \`value\` property has not been explicitly set.`,
        type: { text: "string" },
      },
      {
        kind: "field",
        name: "current-value",
        description:
          `The current value of the element. This property serves as a mechanism
to set the \`value\` property through both property assignment and the
.setAttribute() method. This is useful for setting the field's value
in UI libraries that bind data through the .setAttribute() API
and don't support IDL attribute binding.`,
        type: { text: "string" },
      },
      {
        kind: "field",
        name: "name",
        description:
          `The name of the element. This element's value will be surfaced during form submission under the provided name.`,
        type: { text: "string" },
      },
      {
        kind: "field",
        name: "required",
        description:
          `Require the field to be completed prior to form submission.`,
        type: { text: "boolean" },
      },
    ],
    superclass: {
      name: "FoundationElement",
    },
    customElement: true,
  };

  // Only checkbox and radio differ from the base class
  if (
    className === "FormAssociatedCheckbox" ||
    className === "FormAssociatedRadio"
  ) {
    declaration.members!.push(
      {
        kind: "field",
        name: "checked",
        description: `Provides the default checkedness of the input element`,
        type: { text: "boolean" },
      },
      {
        kind: "field",
        name: "current-checked",
        description:
          `The current checkedness of the element. This property serves as a mechanism
to set the \`checked\` property through both property assignment and the
.setAttribute() method. This is useful for setting the field's checkedness
in UI libraries that bind data through the .setAttribute() API
and don't support IDL attribute binding.`,
        type: { text: "boolean" },
      },
    );
  }

  return declaration;
};

// Inherit items that are not already present in the child
function inheritItems<T>(getName: (item: T) => string, superItems: T[] = [], childItems: T[] = []): T[] {
  return [...superItems.filter(s => !childItems.some(c => getName(s) === getName(c))), ...childItems];
}

const resolveComponentDeclaration = (reference: Reference): Declaration | undefined => {
  let declaration: Declaration | undefined

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
    addInheritedItems(declaration)
  }

  return declaration
};

export const addInheritedItems = (classLike: ClassLike) => {
  const declaration = classLike as Declaration
  const superclassDeclaration = declaration.superclass ? resolveComponentDeclaration(declaration.superclass) : undefined

  if (superclassDeclaration) {
    // Inherit members and events from the superclass
    // Note: we don't inherit slots, as Vivid components often don't implement them
    // we also don't inherit attributes, because they're duplicated as members
    declaration.members = inheritItems(m => m.name, superclassDeclaration.members?.filter(m => m.inheritedFrom?.name !== 'FoundationElement'), declaration.members);
    declaration.events = inheritItems(m => m.name, superclassDeclaration.events, declaration.events);
  }
}