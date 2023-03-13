import { ClassLike, Event, ClassField, Slot, CssCustomProperty, CssPart } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { getClassName } from '../custom.elements.ts'

export type TypeDeclaration = {
  name: string
  declaration: string
}

export type TypeDeclarationsMap = Record<string, TypeDeclaration>

export interface IAbstractClassLikeDecorator {
  get className(): string
}

export interface IAbstractClassLikeDecoratorConstructor {
  new(classLike: ClassLike, vividIndexJs: string): IAbstractClassLikeDecorator
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

export const isImportsProviderDecorator = (decorator: IAbstractClassLikeDecorator): decorator is IImportsProviderDecorator => (decorator as IImportsProviderDecorator).imports !== undefined;
export const isTypeDeclarationsProviderDecorator = (decorator: IAbstractClassLikeDecorator): decorator is ITypeDeclarationsProviderDecorator => (decorator as ITypeDeclarationsProviderDecorator).typeDeclarations !== undefined;
export const isPropertiesDecorator = (decorator: IAbstractClassLikeDecorator): decorator is IPropertiesDecorator => (decorator as IPropertiesDecorator).decorateProperties !== undefined;
export const isCssPropertiesDecorator = (decorator: IAbstractClassLikeDecorator): decorator is ICssPropertiesDecorator => (decorator as ICssPropertiesDecorator).decorateCSSProperties !== undefined;
export const isCssPartsDecorator = (decorator: IAbstractClassLikeDecorator): decorator is ICssPartsDecorator => (decorator as ICssPartsDecorator).decorateCSSParts !== undefined;
export const isEventsDecorator = (decorator: IAbstractClassLikeDecorator): decorator is IEventsDecorator => (decorator as IEventsDecorator).decorateEvents !== undefined;
export const isSlotsDecorator = (decorator: IAbstractClassLikeDecorator): decorator is ISlotsDecorator => (decorator as ISlotsDecorator).decorateSlots !== undefined;

export abstract class AbstractClassDeclarationDecorator implements IAbstractClassLikeDecorator {
  protected classLike: ClassLike
  protected vividIndexJs: string;

  constructor (classLike: ClassLike, vividIndexJs: string) {
    this.classLike = classLike
    this.vividIndexJs = vividIndexJs
  }

  get className(): string {
    return getClassName(this.classLike!)
  }
}