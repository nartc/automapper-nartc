import { AutoMapper } from './automapper';

export type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

export enum TransformationType {
  /**
   * when `opts.ignore()` is used on `forMember()`
   */
  Ignore = 0,
  /**
   * when `opts.mapFrom()` is used on `forMember()`
   */
  MapFrom = 1,
  /**
   * when `opts.condition()` is used on `forMember()`
   */
  Condition = 2,
  /**
   * when `opts.fromValue()` is used on `forMember()`
   */
  FromValue = 3,
  /**
   * when `opts.mapWith()` is used on `forMember()`
   */
  MapWith = 4,
  /**
   * when `opts.convertUsing()` is used on `forMember()`
   */
  ConvertUsing = 5
}

/**
 * A new-able type
 */
export type Constructable<T extends { [key in keyof T]: any } = any> = new (...args: any[]) => T;

export type MapActionOptions<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any
> = {
  beforeMap?: BeforeAfterMapAction<TSource, TDestination>;
  afterMap?: BeforeAfterMapAction<TSource, TDestination>;
};

export type BeforeAfterMapAction<TSource, TDestination> = (
  source: TSource,
  destination: TDestination,
  mapping?: Mapping
) => void;

export interface Converter<TSource, TDestination> {
  convert(source: TSource): TDestination;
}

export interface Resolver<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any,
  K extends keyof TDestination = never
> {
  resolve(
    source: TSource,
    destination: TDestination,
    transformation: MappingTransformation<TSource, TDestination>
  ): TDestination[K];
}

/**
 * Value Selector from a source type
 *
 * @example
 *
 * ```ts
 * source => source.foo.bar
 * ```
 */
export type ValueSelector<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any,
  K extends keyof TDestination = never
> = (source: TSource) => TDestination[K];

export type MapFromCallback<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any,
  K extends keyof TDestination = never
> = ValueSelector<TSource, TDestination, K> | Resolver<TSource, TDestination, K>;

/**
 * Condition Predicate from a source
 */
export type ConditionPredicate<TSource extends { [key in keyof TSource]: any }> = (
  source: TSource
) => boolean;

/**
 * Options for mapWith
 */
export type MapWithOptions<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any
> = {
  destination: Constructable<Unpacked<TDestination[keyof TDestination]>>;
  value: ValueSelector<TSource>;
};

export type ConvertUsingOptions<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any
> = {
  converter: Converter<TSource[keyof TSource], TDestination[keyof TDestination]>;
  value?: (source: TSource) => TSource[keyof TSource];
};

export interface DestinationMemberConfigOptions<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any,
  K extends keyof TDestination = never
> {
  mapFrom(cb: MapFromCallback<TSource, TDestination, K>): void;

  mapWith(
    destination: Constructable<Unpacked<TDestination[K]>>,
    value: ValueSelector<TSource>
  ): void;

  condition(predicate: ConditionPredicate<TSource>): void;

  fromValue(value: TDestination[K]): void;

  ignore(): void;

  convertUsing<
    TConvertSource extends TSource[keyof TSource],
    TConvertDestination extends TDestination[K]
  >(
    converter: Converter<TConvertSource, TConvertDestination>,
    value?: (source: TSource) => TConvertSource
  ): void;
}

export interface ForMemberExpression<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any,
  K extends keyof TDestination = never
> {
  (opts: DestinationMemberConfigOptions<TSource, TDestination, K>): void;
}

export type ForPathDestinationFn<
  TDestination extends { [key in keyof TDestination]: any } = any
> = (destination: TDestination) => TDestination[keyof TDestination];

export interface CreateReverseMapFluentFunctions<
  TDestination extends { [key in keyof TDestination]: any } = any,
  TSource extends { [key in keyof TSource]: any } = any
> {
  forPath<K extends keyof TSource>(
    destination: ForPathDestinationFn<TSource>,
    forPathFn: ForMemberExpression<TDestination, TSource, K>
  ): CreateReverseMapFluentFunctions<TDestination, TSource>;
}

export interface CreateMapFluentFunctions<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any
> {
  forMember<K extends keyof TDestination>(
    key: K,
    expression: ForMemberExpression<TSource, TDestination, K>
  ): CreateMapFluentFunctions<TSource, TDestination>;

  beforeMap(
    action: BeforeAfterMapAction<TSource, TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination>;

  afterMap(
    action: BeforeAfterMapAction<TSource, TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination>;

  reverseMap(): CreateReverseMapFluentFunctions<TDestination, TSource>;

  setSourceNamingConvention(
    namingConvention: NamingConvention
  ): CreateMapFluentFunctions<TSource, TDestination>;

  setDestinationNamingConvention(
    namingConvention: NamingConvention
  ): CreateMapFluentFunctions<TSource, TDestination>;
}

export interface Configuration {
  addProfile(profile: MappingProfile): void;

  createMap<TSource, TDestination>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination>;
}

export interface MappingTransformation<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any
> {
  transformationType: TransformationType;
  mapFrom: MapFromCallback<TSource, TDestination>;
  mapWith: MapWithOptions<TSource, TDestination>;
  condition: ConditionPredicate<TSource>;
  fromValue: TDestination[keyof TDestination];
  convertUsing: ConvertUsingOptions<TSource, TDestination>;
}

export interface MappingProperty<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any
> {
  destinationKey: keyof TDestination;
  transformation: MappingTransformation<TSource, TDestination>;
}

export interface Mapping<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any
> {
  source: Constructable<TSource>;
  destination: Constructable<TDestination>;
  sourceKey: string;
  destinationKey: string;
  properties: Map<keyof TDestination, MappingProperty<TSource, TDestination>>;
  sourceMemberNamingConvention: NamingConvention;
  destinationMemberNamingConvention: NamingConvention;
  beforeMapAction?: BeforeAfterMapAction<TSource, TDestination>;
  afterMapAction?: BeforeAfterMapAction<TSource, TDestination>;
}

export interface MappingProfile {
  profileName: string;
  configure: (mapper: AutoMapper) => void;
}

export type NamingConvention = {
  splittingExpression: RegExp;
  separatorCharacter: string;
  transformPropertyName: (sourcePropNameParts: string[]) => string;
};
