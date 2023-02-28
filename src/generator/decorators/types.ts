import { ClassLike, Event, ClassField } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { getClassName } from '../custom.elements.ts'

export type TypeDeclaration = {
  name: string
  declaration: string
}

export type TypeDeclarationsMap = Record<string, TypeDeclaration>

export interface IAbstractClassLikeDecorator {
  init(classDeclaration: ClassLike): void
}

export interface IImportsProviderDecorator extends IAbstractClassLikeDecorator {
  get imports(): string[]
}

export interface ITypeDeclarationsProviderDecorator extends IAbstractClassLikeDecorator {
  get typeDeclarations(): TypeDeclaration[]
}

export interface IPropertiesDecorator extends IAbstractClassLikeDecorator {
  /**
   * Mutates the properties
   * @param properties initial properties, mutated by the previous decorator
   */
  decorateProperties(properties: ClassField[]): ClassField[]
}

export interface IEventsDecorator extends IAbstractClassLikeDecorator {
  /**
   * Mutates the events
   * @param events initial events, mutated by the previous decorator
   */
  decorateEvents(events: Event[]): Event[]
}

export abstract class AbstractClassDeclarationDecorator implements IAbstractClassLikeDecorator {
  protected classLike?: ClassLike

  get className(): string {
    return getClassName(this.classLike!)
  }

  init(classLike: ClassLike): void {
    this.classLike = classLike
  }
}