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

  extraPropertiesMap: Record<string, ClassField[]> = {
    Button: [
      {
        kind: "field",
        name: "icon",
        type: {
          text: "string"
        }
      },
    ]
  }

  decorateProperties = (properties: ClassField[]) =>
    [
      ...properties,
      ...(this.extraPropertiesMap[this.classLike!.name] ?? [])
    ]
}