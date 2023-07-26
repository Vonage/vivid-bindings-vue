import { escapeStringRegexp } from 'https://raw.githubusercontent.com/Sab94/escape-string-regexp/master/mod.ts'
import { ClassField, ClassMethod, PropertyLike } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { getElementRegistrationFunctionName } from '../custom.elements.ts'
import {
  AbstractClassDeclarationDecorator,
  IImportsProviderDecorator,
  IMethodsDecorator,
  IPropertiesDecorator
} from "./types.ts"

/**
 * Provides aggregated import statements
 */
export class ImportsDecorator extends AbstractClassDeclarationDecorator implements
  IPropertiesDecorator,
  IMethodsDecorator,
  IImportsProviderDecorator {

  extraImports: Record<string, string[]> = {
    AccordionItem: [
      "import { AccordionItemSize } from '@vonage/vivid/lib/accordion-item/accordion-item'"
    ],
    Alert: [
      "import { AlertPlacement } from '@vonage/vivid/lib/alert/alert'"
    ],
    Checkbox: [
      "import { CheckboxConnotation } from '@vonage/vivid/lib/checkbox/checkbox'"
    ],
    DataGrid: [
      "import { DataGridSelectionMode } from '@vonage/vivid/lib/data-grid/data-grid'"
    ],
    Pagination: [
      "import { PaginationSize } from '@vonage/vivid/lib/pagination/pagination'",
      "import { Button } from '@vonage/vivid/lib/button/button'"
    ],
    Radio: [
      "import { RadioConnotation } from '@vonage/vivid/lib/radio/radio'"
    ],
    Tabs: [
      "import { TabsConnotation } from '@vonage/vivid/lib/tabs/tabs'"
    ]
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

  get imports(): string[] {
    return [
      `import { ${this.vividExportedTypes.join(', ')} } from '@vonage/vivid'`,
      ...(this.methods.length > 0 ? [`import { ref } from 'vue'`] : []),
      ...(this.extraImports[this.className] ?? [])
    ]
  }

  decorateMethods = (methods: ClassMethod[]) => {
    this.methods = methods
    this.methodParamTypeNames = this.getTypeNames(this.methods.flatMap(m => m.parameters ?? []))
    return methods
  }

  decorateProperties = (properties: ClassField[]) => {
    this.propertyTypeNames = this.getTypeNames(properties)
    return properties
  }

  getTypeNames = (properties: PropertyLike[]) =>
    properties
      .filter(({ type }) => type)
      .flatMap(({ type }) => type!.text.split('|').map(x => x.trim()))

  protected isVividExportedType = (typeName: string): boolean =>
    this.componentDefinitions.some(definitionText =>
      new RegExp(`export.*\{.*\\b${escapeStringRegexp(typeName)}\\b.*\}`, 'g').test(definitionText)
    )
}