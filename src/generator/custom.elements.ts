import customElements from 'https://esm.sh/@vonage/vivid@latest/custom-elements.json' assert { type: "json" }
import {
  Package,
  Event,
  ClassLike,
  Slot,
  CssCustomProperty,
  CssPart,
  ClassMethod,
  Attribute
} from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { tagPrefix } from '../consts.ts'
import {
  TypeDeclarationsMap,
  IAbstractClassLikeDecoratorConstructor,
  isAttributesDecorator,
  isTypeDeclarationsProviderDecorator,
  isCssPropertiesDecorator,
  isCssPartsDecorator,
  isEventsDecorator,
  isSlotsDecorator,
  isImportsProviderDecorator,
  isMethodsDecorator
} from './decorators/types.ts'
import { camel2kebab, getClassDeclarations } from './utils.ts'
import { addInheritedItems } from "./custom.elements.inheritance.ts"

/**
 * Some Vivid custom elements classes breaks the naming convention, this map is needed to mitigate that fact
 */
const ClassNameAlias: Record<string, string> = {
  ListboxOption: 'Option'
}

export const getClassName = (classLike: ClassLike) => ClassNameAlias[classLike.name] ?? classLike.name
export const getTagName = (classLike: ClassLike) => `${tagPrefix}-${camel2kebab(getClassName(classLike))}`
export const getVividElementDocUrl = (classLike: ClassLike) => `https://vivid.deno.dev/components/${camel2kebab(getClassName(classLike))}`
export const getComponentName = (classLike: ClassLike) => `Vwc${getClassName(classLike)}`
export const getElementRegistrationFunctionName = (classLike: ClassLike) => `register${getClassName(classLike)}`
export const getVividElementVueModels = (classLike: ClassLike) => {
  const vueModelsMap: Record<string, VueModel[]> = {
    Checkbox: [{
      attributeName: 'current-checked',
      eventName: 'change',
      valueMapping: '($event.target as HTMLInputElement).checked',
    }],
    Combobox: [{
      attributeName: 'current-value',
      eventName: 'change',
      valueMapping: '($event.target as HTMLInputElement).value',
    }],
    DatePicker: [{
      attributeName: 'value',
      eventName: 'input',
      valueMapping: '($event.target as HTMLInputElement).value'
    }],
    DateRangePicker: [{
      name: 'start',
      attributeName: 'current-start',
      eventName: 'input:start',
      valueMapping: '($event.target as any).start',
    },
    {
      name: 'end',
      attributeName: 'current-end',
      eventName: 'input:end',
      valueMapping: '($event.target as any).end',
    }],
    Switch: [{
      attributeName: 'current-checked',
      eventName: 'change',
      valueMapping: '($event.target as HTMLInputElement).checked',
    }],
    MenuItem: [{
      attributeName: 'checked',
      eventName: 'change',
      valueMapping: '($event.target as HTMLInputElement).checked',
    }],
    NumberField: [{
      attributeName: 'current-value',
      eventName: 'input',
      valueMapping: '($event.target as HTMLInputElement).value',
    }],
    RadioGroup: [{
      attributeName: 'value',
      eventName: 'change',
      valueMapping: '($event.target as HTMLInputElement).value',
    }],
    Select: [{
      attributeName: 'current-value',
      eventName: 'input',
      valueMapping: '($event.target as HTMLInputElement).value',
    }],
    Slider: [{
      attributeName: 'current-value',
      eventName: 'change',
      valueMapping: '($event.target as HTMLInputElement).value',
    }],
    TextArea: [{
      attributeName: 'current-value',
      eventName: 'input',
      valueMapping: '($event.target as HTMLInputElement).value',
    }],
    TextField: [{
      attributeName: 'current-value',
      eventName: 'input',
      valueMapping: '($event.target as HTMLInputElement).value',
    }]
  }

  return vueModelsMap[getClassName(classLike)]
}

const getComponentsDefinitions = async () => {
  const libFolderUrl = 'https://unpkg.com/@vonage/vivid@latest/lib'
  const vComponentsIndexResponse = await fetch(`${libFolderUrl}/components.d.ts`)
  const componentsIndex = await vComponentsIndexResponse.text()
  const componentNames = componentsIndex.split('\n')
    .map((exportStatement: string) => exportStatement.match(/'\.\/(.*)\/definition'/)?.[1])
    .filter(x => x)

  const componentDefinitions = []
  const classDefinitions = []
  console.info(`Downloading elements definitions`)
  for (const componentName of componentNames) {
    const componentDefinitionUrl = `${libFolderUrl}/${componentName}/definition.d.ts`

    console.info(`${componentDefinitionUrl}...`)
    const response = await fetch(componentDefinitionUrl)
    const componentDefinitionText = await response.text()
    componentDefinitions.push(componentDefinitionText)

    const classDefinitionUrl = `${libFolderUrl}/${componentName}/${componentName}.d.ts`

    console.info(`${classDefinitionUrl}...`)
    const classResponse = await fetch(classDefinitionUrl)
    const classDefinitionText = await classResponse.text()
    classDefinitions.push(classDefinitionText)
  }

  return { componentDefinitions, classDefinitions }
}

const getValidVividClassDeclarations = async () => {
  const { componentDefinitions, classDefinitions } = await getComponentsDefinitions()
  const classDeclarations = getClassDeclarations(customElements as Package)
  const invalidClassDeclarations = classDeclarations.filter((x) => !componentDefinitions.find(definitionText => definitionText.indexOf(getElementRegistrationFunctionName(x)) > 0)).map(({ name }) => name)
  if (invalidClassDeclarations.length > 0) {
    console.error(`Found incorrectly exported Vivid elements: ${invalidClassDeclarations.join(', ')}`)
  }
  return {
    classDeclarations: classDeclarations.filter(({ name }) => invalidClassDeclarations.indexOf(name) < 0),
    componentDefinitions,
    classDefinitions
  }
}

export interface VueModel {
  name?: string
  attributeName: string
  eventName: string
  valueMapping: string
}

export interface IVividElementsContext {
  /**
   * Custom element tag prefix to be used for Vivid tag elements
   * https://vivid.deno.dev/getting-started/advanced#scoped-elements-alpha
   */
  tagPrefix: string
}
export interface IVividElementVisitorContext {
  vueComponentName: string
  vividElementDocUrl: string
  vueModels: VueModel[]
  tagName: string
  attributes: Attribute[]
  methods: ClassMethod[]
  cssProperties: CssCustomProperty[]
  cssParts: CssPart[]
  events: Event[]
  slots: Slot[]
  imports: string[]
  classDeclaration: ClassLike
}
export interface IVividElementsSharedContext {
  /**
   * Shared type declarations dynamically emitted by the decorators
   */
  typeDeclarations: TypeDeclarationsMap
}

/**
 * Enumerates all properly exported Vivid custom elements
 * @param classLikeDecorators a list of decorator classes to be instantiated & applied *before* visiting the element by the visitor function
 * @param elementVisitor passes `IVividElementVisitorContext` to the visitor function
 * @returns `IVividElementsSharedContext` shared elements context built dynamically by the decorators
 */
export const enumerateVividElements = async (
  classLikeDecorators: IAbstractClassLikeDecoratorConstructor[],
  elementVisitor: (context: IVividElementVisitorContext) => Promise<void>): Promise<IVividElementsSharedContext> => {
  const { classDeclarations, componentDefinitions, classDefinitions } = await getValidVividClassDeclarations()
  const result = <IVividElementsSharedContext>{
    typeDeclarations: {}
  }

  const classDeclarationWithInheritance = classDeclarations.map(c => addInheritedItems(c, classDefinitions))

  for (const classDeclaration of classDeclarationWithInheritance) {
    const imports = []
    let attributes = classDeclaration.attributes || []
    let methods = classDeclaration.members as ClassMethod[] || []
    let events = classDeclaration.events || []
    let slots = classDeclaration.slots || []
    let cssProperties = classDeclaration.cssProperties || []
    let cssParts = classDeclaration.cssParts || []

    for (const decorator of classLikeDecorators.map(
      (decoratorClass: IAbstractClassLikeDecoratorConstructor) => new decoratorClass(classDeclaration, componentDefinitions)
    )) {
      if (isCssPropertiesDecorator(decorator)) {
        cssProperties = decorator.decorateCSSProperties(cssProperties)
      }

      if (isCssPartsDecorator(decorator)) {
        cssParts = decorator.decorateCSSParts(cssParts)
      }

      if (isSlotsDecorator(decorator)) {
        slots = decorator.decorateSlots(slots)
      }

      if (isAttributesDecorator(decorator)) {
        attributes = decorator.decorateAttributes(attributes)
      }

      if (isMethodsDecorator(decorator)) {
        methods = decorator.decorateMethods(methods)
      }

      if (isTypeDeclarationsProviderDecorator(decorator)) {
        decorator.typeDeclarations.forEach(
          x => result.typeDeclarations[x.name] = x
        )
      }

      if (isEventsDecorator(decorator)) {
        events = decorator.decorateEvents(events)
      }

      if (isImportsProviderDecorator(decorator)) {
        imports.push(...decorator.imports)
      }
    }

    const vueModels = getVividElementVueModels(classDeclaration)
    if (vueModels) {
      attributes = attributes.filter(a => !vueModels.find(({ name = 'modelValue', attributeName }) => [name, attributeName].includes((a.name ?? a.fieldName))))
    }

    await elementVisitor({
      vueComponentName: getComponentName(classDeclaration),
      tagName: getTagName(classDeclaration),
      vividElementDocUrl: getVividElementDocUrl(classDeclaration),
      vueModels,
      attributes,
      methods,
      cssProperties,
      cssParts,
      events,
      slots,
      imports,
      classDeclaration
    })
  }

  return result
}