import customElements from 'https://esm.sh/@vonage/vivid@latest/custom-elements.json' assert { type: "json" }
import { Package, Declaration, ClassDeclaration, ClassField } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { tagPrefix } from '../consts.ts'
import { IAbstractClassDeclarationDecorator, IClassPropertiesDecorator, IImportsProviderDecorator, ITypeDeclarationsProviderDecorator, TypeDeclaration, TypeDeclarationsMap } from './decorators/types.ts'
import { camel2kebab } from './utils.ts'

type ReadOnlyClassField = ClassField & {
  readonly?: boolean
}

const getComponentName = (classDeclaration: ClassDeclaration) => `Vwc${classDeclaration.name}`
const getElementRegistrationFunctionName = (classDeclaration: ClassDeclaration) => `register${classDeclaration.name}`

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
    ) as ClassDeclaration[]
  const invalidClassDeclarations = classDeclarations.filter((x) => vIndexJs.indexOf(getElementRegistrationFunctionName(x)) < 0).map(({ name }) => name)
  if (invalidClassDeclarations.length > 0) {
    console.info(`Found incorrectly exported Vivid elements: ${invalidClassDeclarations.join(', ')}`)
  }
  return classDeclarations.filter(({ name }) => invalidClassDeclarations.indexOf(name) < 0)
}

export const enumerateVividElements = async (
  classDecorators: Array<new () => IAbstractClassDeclarationDecorator>,
  elementVisitor: (
    elementName: string,
    vueComponentName: string,
    tagName: string,
    properties: ClassField[],
    imports: string[],
    typeDeclarations: TypeDeclarationsMap,
    classDeclaration: ClassDeclaration
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

    for (const classDecorator of classDecorators.map(
      (decoratorClass: new () => IAbstractClassDeclarationDecorator) => {
        const instance = new decoratorClass()
        instance.init(classDeclaration)
        return instance
      }
    )) {
      if (classDecorator as IImportsProviderDecorator) {
        imports.push(...(classDecorator as IImportsProviderDecorator).imports)
      }

      if (classDecorator as ITypeDeclarationsProviderDecorator) {
        (classDecorator as ITypeDeclarationsProviderDecorator).typeDeclarations.forEach(
          x => typeDeclarations[x.name] = x
        )
      }

      if (classDecorator as IClassPropertiesDecorator) {
        properties = (classDecorator as IClassPropertiesDecorator).decorateProperties(properties)
      }
    }

    await elementVisitor(
      elementName,
      componentName,
      tagName,
      properties,
      imports,
      typeDeclarations,
      classDeclaration
    )
  }
}