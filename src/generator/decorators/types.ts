import { ClassDeclaration, ClassField } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'

export type TypeDeclaration = {
  name: string
  declaration: string
}

export type TypeDeclarationsMap = Record<string, TypeDeclaration>

export interface IAbstractClassDeclarationDecorator {
  init(classDeclaration: ClassDeclaration): void
}

export interface IImportsProviderDecorator extends IAbstractClassDeclarationDecorator {
  get imports(): string[]
}

export interface ITypeDeclarationsProviderDecorator extends IAbstractClassDeclarationDecorator {
  get typeDeclarations(): TypeDeclaration[]
}

export interface IClassPropertiesDecorator extends IAbstractClassDeclarationDecorator {
  /**
   * Mutates the properties
   * @param properties initial properties, mutated by the previous decorator
   */
  decorateProperties(properties: ClassField[]): ClassField[]
}

export abstract class AbstractClassDeclarationDecorator implements IAbstractClassDeclarationDecorator {
  protected classDeclaration?: ClassDeclaration

  init(classDeclaration: ClassDeclaration): void {
    this.classDeclaration = classDeclaration
  }
}