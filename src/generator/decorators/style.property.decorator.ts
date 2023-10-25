import { Attribute, CssCustomProperty, CssPart } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { styleDirectiveName } from '../../consts.ts'
import {
  AbstractClassDeclarationDecorator,
  ICssPartsDecorator,
  ICssPropertiesDecorator,
  IImportsProviderDecorator,
  IAttributesDecorator
} from "./types.ts"

/**
 * Replaces default vue `style` property as of type `unknown` by enhanced type `CSSProperties` + extra custom cssProperties + cssParts supported by the Vivid element
 */
export class StylePropertyDecorator extends AbstractClassDeclarationDecorator implements
  ICssPropertiesDecorator,
  ICssPartsDecorator,
  IImportsProviderDecorator,
  IAttributesDecorator {

  protected cssProperties: CssCustomProperty[] = []
  protected cssParts: CssPart[] = []

  get imports(): string[] {
    return [
      ...(this.isCustomPropertyApplicable ? [`import { CSSProperties } from 'vue'`] : []),
    ]
  }

  get isCustomPropertyApplicable(): boolean {
    return this.cssProperties.length > 0 || this.cssParts.length > 0
  }

  decorateCSSParts = (cssParts: CssPart[]) => {
    this.cssParts = cssParts
    return cssParts
  }

  decorateCSSProperties = (cssProperties: CssCustomProperty[]) => {
    this.cssProperties = cssProperties
    return cssProperties
  }

  get propertyDescription(): string {
    return `Inline styles object includes standard CSSProperties plus custom css variables suitable for this Vivid element${this.cssParts.length > 0
      ? `\n\nAlso there are following css Parts(https://developer.mozilla.org/en-US/docs/Web/CSS/::part) supported:\n${this.cssParts.map(
        ({ name, description }) => `- \`${name}\` - ${[description,
          `usage: \`<${this.vueComponentName} v-${styleDirectiveName}.${name}="{ 'background-color': 'red' }" />\``].join(', ')}`
      )}`
      : ''
      }`
  }

  decorateAttributes = (attributes: Attribute[]) => attributes.map(
    (attr) => {
      if (attr.type &&
        (
          (attr.name === 'style') && this.isCustomPropertyApplicable
        )
      ) {
        attr.type.text = `CSSProperties & {\n${this.cssProperties.map(({ name, description, syntax }) => `    /**\n    * ${description}\n    */\n    '${name}'?: ${this.tsTypeFromCssType(syntax)}`).join('\n')}\n  }`
        attr.description = this.propertyDescription
      }
      return attr
    }
  )

  /**
   * Translates Css syntax type to Typescript suitable type
   * @param cssSyntax syntax text defined here https://developer.mozilla.org/en-US/docs/Web/CSS/@property/syntax
   * @returns Typescript suitable type or any
   */
  protected tsTypeFromCssType(cssSyntax: string | undefined): string {
    if (!cssSyntax) {
      return 'any'
    }
    if (['<integer>', '<number>'].includes(cssSyntax)) {
      return 'number'
    }
    if (cssSyntax === '<string>') {
      return 'string'
    }
    return 'any'
  }
}