import customElements from 'https://esm.sh/@vonage/vivid@latest/custom-elements.json' assert { type: "json" }
import {
  Package, Declaration,
  CustomElement,
  Event,
  ClassLike,
  ClassField,
  Slot,
  CssCustomProperty,
  CssPart,
  ClassMethod
} from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { tagPrefix } from '../consts.ts'
import {
  TypeDeclarationsMap,
  IAbstractClassLikeDecoratorConstructor,
  isPropertiesDecorator,
  isTypeDeclarationsProviderDecorator,
  isCssPropertiesDecorator,
  isCssPartsDecorator,
  isEventsDecorator,
  isSlotsDecorator,
  isImportsProviderDecorator,
  isMethodsDecorator
} from './decorators/types.ts'
import { camel2kebab, getNthGroupMatch } from './utils.ts'

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
export const getVividElementVueModel = (classLike: ClassLike) => {
  const vueModelMap: Record<string, VueModel> = {
    Checkbox: {
      attributeName: 'current-checked',
      eventName: 'change',
      valueMapping: '($event.target as HTMLInputElement).checked',
    },
    Combobox: {
      attributeName: 'current-value',
      eventName: 'change',
      valueMapping: '($event.target as HTMLInputElement).value',
    },
    MenuItem: {
      attributeName: 'checked',
      eventName: 'change',
      valueMapping: '($event.target as HTMLInputElement).checked',
    },
    NumberField: {
      attributeName: 'current-value',
      eventName: 'input',
      valueMapping: '($event.target as HTMLInputElement).value',
    },
    RadioGroup: {
      attributeName: 'value',
      eventName: 'change',
      valueMapping: '($event.target as HTMLInputElement).value',
    },
    Select: {
      attributeName: 'current-value',
      eventName: 'input',
      valueMapping: '($event.target as HTMLInputElement).value',
    },
    Slider: {
      attributeName: 'current-value',
      eventName: 'change',
      valueMapping: '($event.target as HTMLInputElement).value',
    },
    TextArea: {
      attributeName: 'current-value',
      eventName: 'input',
      valueMapping: '($event.target as HTMLInputElement).value',
    },
    TextField: {
      attributeName: 'current-value',
      eventName: 'input',
      valueMapping: '($event.target as HTMLInputElement).value',
    }
  }

  return vueModelMap[getClassName(classLike)]
}

const getComponentsDefinitions = async () => {
  const libFolderUrl = 'https://unpkg.com/@vonage/vivid@latest/lib'
  const vComponentsIndexResponse = await fetch(`${libFolderUrl}/components.d.ts`)
  const componentsIndex = await vComponentsIndexResponse.text()
  const componentDefinitionsUrls = componentsIndex.split('\n')
    .map((exportStatement: string) => getNthGroupMatch(/'\.(.*)'/g, exportStatement))
    .filter(x => x)
    .map(x => `${libFolderUrl}${x}.d.ts`)

  const componentDefinitions = []
  console.info(`Downloading elements definitions`)
  for await (const componentDefinitionUrl of componentDefinitionsUrls) {
    const response = await fetch(componentDefinitionUrl)
    const componentDefinitionText = await response.text()
    componentDefinitions.push(componentDefinitionText)
    console.info(`${componentDefinitionUrl}...`)
  }
  return { componentDefinitions }
}

const getValidVividClassDeclarations = async () => {
  const { componentDefinitions } = await getComponentsDefinitions()
  const classDeclarations = (customElements as Package).modules.reduce
    ((acc, { declarations }) =>
      [
        ...acc,
        ...(declarations || []).filter(({ kind }) => kind === 'class')
      ]
      ,
      [] as Declaration[]
    ) as ClassLike[]
  const invalidClassDeclarations = classDeclarations.filter((x) => !componentDefinitions.find(definitionText => definitionText.indexOf(getElementRegistrationFunctionName(x)) > 0)).map(({ name }) => name)
  if (invalidClassDeclarations.length > 0) {
    console.error(`Found incorrectly exported Vivid elements: ${invalidClassDeclarations.join(', ')}`)
  }
  return {
    classDeclarations: classDeclarations.filter(({ name }) => invalidClassDeclarations.indexOf(name) < 0),
    componentDefinitions
  }
}

export interface VueModel {
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
  vueModel: VueModel
  tagName: string
  properties: ClassField[]
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
  const { classDeclarations, componentDefinitions } = await getValidVividClassDeclarations()
  const result = <IVividElementsSharedContext>{
    typeDeclarations: {}
  }

  for await (const classDeclaration of classDeclarations) {
    const imports = []
    let properties = classDeclaration.members as ClassField[] || []
    let methods = classDeclaration.members as ClassMethod[] || []
    let events = (classDeclaration as CustomElement).events || []
    let slots = (classDeclaration as CustomElement).slots || []
    let cssProperties = (classDeclaration as CustomElement).cssProperties || []
    let cssParts = (classDeclaration as CustomElement).cssParts || []

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

      if (isPropertiesDecorator(decorator)) {
        properties = decorator.decorateProperties(properties)
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

    await elementVisitor({
      vueComponentName: getComponentName(classDeclaration),
      tagName: getTagName(classDeclaration),
      vividElementDocUrl: getVividElementDocUrl(classDeclaration),
      vueModel: getVividElementVueModel(classDeclaration),
      properties,
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