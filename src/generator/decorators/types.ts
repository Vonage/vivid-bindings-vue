import { ClassLike, Event, ClassField, Slot, CssCustomProperty, CssPart } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
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

export interface ICssPropertiesDecorator extends IAbstractClassLikeDecorator {
  /**
   * Mutates the css properties
   * @param properties initial properties, mutated by the previous decorator
   */
  decorateCSSProperties(properties: CssCustomProperty[]): CssCustomProperty[]
}

export interface ICssPartsDecorator extends IAbstractClassLikeDecorator {
  /**
   * Mutates the css parts
   * @param parts initial parts, mutated by the previous decorator
   */
  decorateCSSParts(parts: CssPart[]): CssPart[]
}

export interface IEventsDecorator extends IAbstractClassLikeDecorator {
  /**
   * Mutates the events
   * @param events initial events, mutated by the previous decorator
   */
  decorateEvents(events: Event[]): Event[]
}

export interface ISlotsDecorator extends IAbstractClassLikeDecorator {
  /**
   * Mutates the slots
   * @param slots initial slots, mutated by the previous decorator
   */
  decorateSlots(events: Slot[]): Slot[]
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