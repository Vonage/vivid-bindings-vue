import customElements from 'https://esm.sh/@vonage/vivid@latest/custom-elements.json' assert { type: "json" }
import {
  Package, Declaration,
  CustomElement,
  Event,
  ClassLike,
  ClassField,
  Slot,
  CssCustomProperty,
  CssPart
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
  isImportsProviderDecorator
} from './decorators/types.ts'
import { camel2kebab } from './utils.ts'

export const ClassNameAlias: Record<string, string> = {
  ListboxOption: 'Option'
}

export const getClassName = (classLike: ClassLike) => ClassNameAlias[classLike.name] ?? classLike.name
const getComponentName = (classLike: ClassLike) => `Vwc${getClassName(classLike)}`
export const getElementRegistrationFunctionName = (classLike: ClassLike) => `register${getClassName(classLike)}`

const getValidVividClassDeclarations = async () => {
  const vIndexJsResponse = await fetch('https://unpkg.com/@vonage/vivid@latest/index.js')
  const vividIndexJs = await vIndexJsResponse.text()
  const classDeclarations = (customElements as Package).modules.reduce
    ((acc, { declarations }) =>
      [
        ...acc,
        ...(declarations || []).filter(({ kind }) => kind === 'class')
      ]
      ,
      [] as Declaration[]
    ) as ClassLike[]
  const invalidClassDeclarations = classDeclarations.filter((x) => vividIndexJs.indexOf(getElementRegistrationFunctionName(x)) < 0).map(({ name }) => name)
  if (invalidClassDeclarations.length > 0) {
    console.info(`Found incorrectly exported Vivid elements: ${invalidClassDeclarations.join(', ')}`)
  }
  return {
    classDeclarations: classDeclarations.filter(({ name }) => invalidClassDeclarations.indexOf(name) < 0),
    vividIndexJs
  }
}

export const enumerateVividElements = async (
  classLikeDecorators: IAbstractClassLikeDecoratorConstructor[],
  elementVisitor: (
    vueComponentName: string,
    tagName: string,
    properties: ClassField[],
    cssProperties: CssCustomProperty[],
    cssParts: CssPart[],
    events: Event[],
    slots: Slot[],
    imports: string[],
    typeDeclarations: TypeDeclarationsMap,
    classDeclaration: ClassLike
  ) => Promise<void>) => {
  const { classDeclarations, vividIndexJs } = await getValidVividClassDeclarations()

  for await (const classLike of classDeclarations) {
    const imports = []
    const typeDeclarations: Record<string, TypeDeclaration> = {}
    const elementName = getClassName(classLike)
    const componentName = getComponentName(classLike)
    const tagName = `${tagPrefix}-${camel2kebab(elementName)}`
    let properties = classLike.members as ClassField[] || []
    let events = (classLike as CustomElement).events || []
    let slots = (classLike as CustomElement).slots || []
    let cssProperties = (classLike as CustomElement).cssProperties || []
    let cssParts = (classLike as CustomElement).cssParts || []

    for (const decorator of classLikeDecorators.map(
      (decoratorClass: IAbstractClassLikeDecoratorConstructor) => new decoratorClass(classLike, vividIndexJs)
    )) {
      if (isPropertiesDecorator(decorator)) {
        properties = decorator.decorateProperties(properties)
      }

      if (isTypeDeclarationsProviderDecorator(decorator)) {
        decorator.typeDeclarations.forEach(
          x => typeDeclarations[x.name] = x
        )
      }

      if (isCssPropertiesDecorator(decorator)) {
        cssProperties = decorator.decorateCSSProperties(cssProperties)
      }

      if (isCssPartsDecorator(decorator)) {
        cssParts = decorator.decorateCSSParts(cssParts)
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

    await elementVisitor(
      componentName,
      tagName,
      properties,
      cssProperties,
      cssParts,
      events,
      slots,
      imports,
      typeDeclarations,
      classLike
    )
  }
}