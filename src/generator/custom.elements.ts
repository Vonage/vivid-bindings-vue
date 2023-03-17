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
  TypeDeclaration,
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

export const ClassNameAlias: Record<string, string> = {
  ListboxOption: 'Option'
}

export const getClassName = (classLike: ClassLike) => ClassNameAlias[classLike.name] ?? classLike.name
const getComponentName = (classLike: ClassLike) => `Vwc${getClassName(classLike)}`
export const getElementRegistrationFunctionName = (classLike: ClassLike) => `register${getClassName(classLike)}`

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

export const enumerateVividElements = async (
  classLikeDecorators: IAbstractClassLikeDecoratorConstructor[],
  elementVisitor: (props: {
    vueComponentName: string,
    tagName: string,
    properties: ClassField[],
    methods: ClassMethod[],
    cssProperties: CssCustomProperty[],
    cssParts: CssPart[],
    events: Event[],
    slots: Slot[],
    imports: string[],
    typeDeclarations: TypeDeclarationsMap,
    classDeclaration: ClassLike
  }) => Promise<void>) => {
  const { classDeclarations, componentDefinitions } = await getValidVividClassDeclarations()

  for await (const classDeclaration of classDeclarations) {
    const imports = []
    const typeDeclarations: Record<string, TypeDeclaration> = {}
    const elementName = getClassName(classDeclaration)
    const vueComponentName = getComponentName(classDeclaration)
    const tagName = `${tagPrefix}-${camel2kebab(elementName)}`
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

      if (isPropertiesDecorator(decorator)) {
        properties = decorator.decorateProperties(properties)
      }

      if (isMethodsDecorator(decorator)) {
        methods = decorator.decorateMethods(methods)
      }

      if (isTypeDeclarationsProviderDecorator(decorator)) {
        decorator.typeDeclarations.forEach(
          x => typeDeclarations[x.name] = x
        )
      }

      if (isEventsDecorator(decorator)) {
        events = decorator.decorateEvents(events)
      }

      if (isSlotsDecorator(decorator)) {
        slots = decorator.decorateSlots(slots)
      }

      if (isImportsProviderDecorator(decorator)) {
        imports.push(...decorator.imports)
      }
    }

    await elementVisitor({
      vueComponentName,
      tagName,
      properties,
      methods,
      cssProperties,
      cssParts,
      events,
      slots,
      imports,
      typeDeclarations,
      classDeclaration
    })
  }
}