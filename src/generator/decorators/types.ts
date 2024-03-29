import { ClassLike, Event, Slot, CssCustomProperty, CssPart, ClassMethod, Type, Attribute } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { getClassName, getComponentName, getTagName } from '../custom.elements.ts'

export type AsyncClassMethod = ClassMethod & {
  async?: boolean
}

export type InlineClassMethod = ClassMethod & {
  body?: string
}

export type TypeDeclaration = {
  specifier: string
  assignment: string
  name: string
  description: string
  declaration: Type
}

export type TypeDeclarationsMap = Record<string, TypeDeclaration>

export interface IAbstractClassLikeDecorator {
  get className(): string
}

export interface IAbstractClassLikeDecoratorConstructor {
  new(classLike: ClassLike, componentDefinitions: string[]): IAbstractClassLikeDecorator
}

export interface IImportsProviderDecorator extends IAbstractClassLikeDecorator {
  get imports(): string[]
}

export interface ITypeDeclarationsProviderDecorator extends IAbstractClassLikeDecorator {
  get typeDeclarations(): TypeDeclaration[]
}

export interface IAttributesDecorator extends IAbstractClassLikeDecorator {
  /**
   * Mutates the attributes
   * @param attributes initial attributes, mutated by the previous decorator
   */
  decorateAttributes(attributes: Attribute[]): Attribute[]
}

export interface IMethodsDecorator extends IAbstractClassLikeDecorator {
  /**
   * Mutates the methods
   * @param methods initial methods, mutated by the previous decorator
   */
  decorateMethods(methods: ClassMethod[]): ClassMethod[]
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
export const isAttributesDecorator = (decorator: IAbstractClassLikeDecorator): decorator is IAttributesDecorator => (decorator as IAttributesDecorator).decorateAttributes !== undefined;
export const isMethodsDecorator = (decorator: IAbstractClassLikeDecorator): decorator is IMethodsDecorator => (decorator as IMethodsDecorator).decorateMethods !== undefined;
export const isCssPropertiesDecorator = (decorator: IAbstractClassLikeDecorator): decorator is ICssPropertiesDecorator => (decorator as ICssPropertiesDecorator).decorateCSSProperties !== undefined;
export const isCssPartsDecorator = (decorator: IAbstractClassLikeDecorator): decorator is ICssPartsDecorator => (decorator as ICssPartsDecorator).decorateCSSParts !== undefined;
export const isEventsDecorator = (decorator: IAbstractClassLikeDecorator): decorator is IEventsDecorator => (decorator as IEventsDecorator).decorateEvents !== undefined;
export const isSlotsDecorator = (decorator: IAbstractClassLikeDecorator): decorator is ISlotsDecorator => (decorator as ISlotsDecorator).decorateSlots !== undefined;

// TODO: possibly rename "Decorator" to "Transformer"
export abstract class AbstractClassDeclarationDecorator implements IAbstractClassLikeDecorator {
  protected classLike: ClassLike
  protected componentDefinitions: string[];

  constructor(classLike: ClassLike, componentDefinitions: string[]) {
    this.classLike = classLike
    this.componentDefinitions = componentDefinitions
  }

  get className(): string {
    return getClassName(this.classLike!)
  }

  get tagName(): string {
    return getTagName(this.classLike!)
  }

  get vueComponentName(): string {
    return getComponentName(this.classLike!)
  }
}