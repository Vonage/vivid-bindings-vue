import customElements from 'https://esm.sh/@vonage/vivid@latest/custom-elements.json' assert { type: "json" }
import {
  Package, Declaration,
  CustomElement,
  Event,
  ClassLike,
  ClassField
} from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { tagPrefix } from '../consts.ts'
import {
  IAbstractClassLikeDecorator,
  IPropertiesDecorator,
  IImportsProviderDecorator,
  ITypeDeclarationsProviderDecorator,
  TypeDeclaration,
  TypeDeclarationsMap,
  IEventsDecorator
} from './decorators/types.ts'
import { camel2kebab } from './utils.ts'

type ReadOnlyClassField = ClassField & {
  readonly?: boolean
}

const getComponentName = (classDeclaration: ClassLike) => `Vwc${classDeclaration.name}`
const getElementRegistrationFunctionName = (classDeclaration: ClassLike) => `register${classDeclaration.name}`

const getValidVividClassDeclarations = async () => {
  const vIndexJsResponse = await fetch('https://unpkg.com/@vonage/vivid@latest/index.js')
  const vIndexJs = await vIndexJsResponse.text()
  const classDeclarations = (customElements as Package).modules.reduce
    ((acc, { declarations }) =>
      [
        ...acc,
        ...(declarations || []).filter(({ kind }) => kind === 'class')
      ]
      ,
      [] as Declaration[]
    ) as ClassLike[]
  const invalidClassDeclarations = classDeclarations.filter((x) => vIndexJs.indexOf(getElementRegistrationFunctionName(x)) < 0).map(({ name }) => name)
  if (invalidClassDeclarations.length > 0) {
    console.info(`Found incorrectly exported Vivid elements: ${invalidClassDeclarations.join(', ')}`)
  }
  return classDeclarations.filter(({ name }) => invalidClassDeclarations.indexOf(name) < 0)
}

const isImportsProviderDecorator = (decorator: IAbstractClassLikeDecorator): decorator is IImportsProviderDecorator => (decorator as IImportsProviderDecorator).imports !== undefined;
const isTypeDeclarationsProviderDecorator = (decorator: IAbstractClassLikeDecorator): decorator is ITypeDeclarationsProviderDecorator => (decorator as ITypeDeclarationsProviderDecorator).typeDeclarations !== undefined;
const isPropertiesDecorator = (decorator: IAbstractClassLikeDecorator): decorator is IPropertiesDecorator => (decorator as IPropertiesDecorator).decorateProperties !== undefined;
const isEventsDecorator = (decorator: IAbstractClassLikeDecorator): decorator is IEventsDecorator => (decorator as IEventsDecorator).decorateEvents !== undefined;

export const enumerateVividElements = async (
  classLikeDecorators: Array<new () => IAbstractClassLikeDecorator>,
  elementVisitor: (
    elementName: string,
    vueComponentName: string,
    tagName: string,
    properties: ClassField[],
    events: Event[],
    imports: string[],
    typeDeclarations: TypeDeclarationsMap,
    classDeclaration: ClassLike
  ) => Promise<void>) => {
  const classDeclarations = await getValidVividClassDeclarations()

  for await (const classDeclaration of classDeclarations) {
    const imports = []
    const typeDeclarations: Record<string, TypeDeclaration> = {}
    const elementName = classDeclaration.name
    const componentName = getComponentName(classDeclaration)
    const tagName = `${tagPrefix}-${camel2kebab(elementName)}`
    let properties = (classDeclaration.members?.filter(
      (member) => member.kind === 'field' &&
        (member.privacy ?? 'public') === 'public').filter(
          (member) => member as ReadOnlyClassField ? (member as ReadOnlyClassField).readonly !== true : true
        ) || []) as ClassField[]
    let events = (classDeclaration as CustomElement).events || []

    for (const decorator of classLikeDecorators.map(
      (decoratorClass: new () => IAbstractClassLikeDecorator) => {
        const instance = new decoratorClass()
        instance.init(classDeclaration)
        return instance
      }
    )) {
      if (isImportsProviderDecorator(decorator)) {
        imports.push(...decorator.imports)
      }

      if (isTypeDeclarationsProviderDecorator(decorator)) {
        decorator.typeDeclarations.forEach(
          x => typeDeclarations[x.name] = x
        )
      }

      if (isPropertiesDecorator(decorator)) {
        properties = decorator.decorateProperties(properties)
      }

      if (isEventsDecorator(decorator)) {
        events = decorator.decorateEvents(events)
      }
    }

    await elementVisitor(
      elementName,
      componentName,
      tagName,
      properties,
      events,
      imports,
      typeDeclarations,
      classDeclaration
    )
  }
}