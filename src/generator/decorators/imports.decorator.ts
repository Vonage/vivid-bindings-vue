import { escapeStringRegexp } from 'https://raw.githubusercontent.com/Sab94/escape-string-regexp/master/mod.ts'
import { Attribute, ClassMethod } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { getElementRegistrationFunctionName } from '../custom.elements.ts'
import {
  AbstractClassDeclarationDecorator,
  IImportsProviderDecorator,
  IMethodsDecorator,
  IAttributesDecorator
} from "./types.ts"

/**
 * Provides aggregated import statements
 */
export class ImportsDecorator extends AbstractClassDeclarationDecorator implements
  IAttributesDecorator,
  IMethodsDecorator,
  IImportsProviderDecorator {

  extraImports: Record<string, string> = {
    DateStr: '@vonage/vivid/lib/date-picker/calendar/dateStr',
    FileUploaderSize: '@vonage/vivid/lib/file-picker/file-picker',
    AccordionItemSize: '@vonage/vivid/lib/accordion-item/accordion-item',
    AlertPlacement: '@vonage/vivid/lib/alert/alert',
    CheckboxConnotation: '@vonage/vivid/lib/checkbox/checkbox',
    DataGridSelectionMode: '@vonage/vivid/lib/data-grid/data-grid',
    PaginationSize: '@vonage/vivid/lib/pagination/pagination',
    Button: '@vonage/vivid/lib/button/button',
    RadioConnotation: '@vonage/vivid/lib/radio/radio',
    TabsConnotation: '@vonage/vivid/lib/tabs/tabs',
    CheckAppearance: '@vonage/vivid/lib/menu-item/menu-item',
  }

  protected methods: ClassMethod[] = []
  protected propertyTypeNames: string[] = []
  protected methodParamTypeNames: string[] = []

  get referencedTypeNames(): string[] {
    return [...new Set([...this.propertyTypeNames, ...this.methodParamTypeNames])]
  }

  get vividExportedTypes(): string[] {
    return [
      getElementRegistrationFunctionName(this.classLike!),
      ...this.referencedTypeNames.filter(x => this.isVividExportedType(x))
    ]
  }

  get vividInternallyExportedTypes(): string[] {
    return this.referencedTypeNames.filter(x => x in this.extraImports && !this.isVividExportedType(x))
  }

  get imports(): string[] {
    return [
      `import { ${this.vividExportedTypes.join(', ')} } from '@vonage/vivid'`,
      ...(this.methods.length > 0 ? [`import { ref } from 'vue'`] : []),
      ...(this.vividInternallyExportedTypes.map(x => `import { ${x} } from '${this.extraImports[x]}'`))
    ]
  }

  decorateMethods = (methods: ClassMethod[]) => {
    this.methods = methods
    this.methodParamTypeNames = this.getTypeNames(this.methods.flatMap(m => m.parameters ?? []))
    return methods
  }

  decorateAttributes = (attributes: Attribute[]) => {
    this.propertyTypeNames = this.getTypeNames(attributes)
    return attributes
  }

  getTypeNames = (attributes: Attribute[]) =>
    attributes
      .filter(({ type }) => type)
      .flatMap(({ type }) => type!.text.split('|').map(x => x.trim()))

  protected isVividExportedType = (typeName: string): boolean =>
    this.componentDefinitions.some(definitionText =>
      new RegExp(`export.*\{.*\\b${escapeStringRegexp(typeName)}\\b.*\}`, 'g').test(definitionText)
    )
}