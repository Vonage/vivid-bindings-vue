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

  iconProperty = <ClassField>{
    kind: "field",
    name: "icon",
    type: {
      text: "string"
    }
  }

  extraPropertiesMap: Record<string, ClassField[]> = {
    AccordionItem: [
      this.iconProperty
    ],
    TextField: [
      this.iconProperty
    ],
    Button: [
      this.iconProperty
    ],
    Badge: [
      this.iconProperty
    ],
    Banner: [
      this.iconProperty
    ],
    Fab: [
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
      ...properties,
      ...(this.extraPropertiesMap[this.classLike!.name] ?? [])
    ]
}