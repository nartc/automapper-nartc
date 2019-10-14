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
  MapWith = 5
}

/**
 * A new-able type
 */
export type Constructable<T extends { [key in keyof T]: any } = any> = new (...args: any[]) => T;

export type MapFromCallback<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any,
  K extends keyof TDestination = never
> = (source: TSource) => TDestination[K];

export type ConditionPredicate<TSource extends { [key in keyof TSource]: any }> = (
  source: TSource
) => boolean;

export type MapWithOptions<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any
> = {
  destination: Constructable<Unpacked<TDestination[keyof TDestination]>>;
  value: MapFromCallback<TSource>;
};

export interface SourceMemberConfigOptions<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any
> {
  ignore(): void;
}

export interface DestinationMemberConfigOptions<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any,
  K extends keyof TDestination = never
> extends SourceMemberConfigOptions<TSource, TDestination> {
  mapFrom(cb: MapFromCallback<TSource, TDestination, K>): void;

  mapWith(
    destination: Constructable<Unpacked<TDestination[K]>>,
    value: MapFromCallback<TSource>
  ): void;

  condition(predicate: ConditionPredicate<TSource>): void;

  fromValue(value: TDestination[K]): void;
}

export interface ForMemberFunction<
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
    forPathFn: ForMemberFunction<TDestination, TSource, K>
  ): CreateReverseMapFluentFunctions<TDestination, TSource>;
}

export interface CreateMapFluentFunctions<
  TSource extends { [key in keyof TSource]: any } = any,
  TDestination extends { [key in keyof TDestination]: any } = any
> {
  forMember<K extends keyof TDestination>(
    destinationKey: K,
    forMemberFn: ForMemberFunction<TSource, TDestination, K>
  ): CreateMapFluentFunctions<TSource, TDestination>;

  reverseMap(): CreateReverseMapFluentFunctions<TDestination, TSource>;
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
  mapFrom: (source: TSource) => ReturnType<MapFromCallback<TSource, TDestination>>;
  mapWith: MapWithOptions<TSource, TDestination>;
  condition: ConditionPredicate<TSource>;
  fromValue: TDestination[keyof TDestination];
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
}

export interface MappingProfile {
  profileName: string;
  configure: (mapper: AutoMapper) => void;
}

// export type NamingConvention = {
//   splittingExpression: RegExp;
//   separatorCharacter: string;
//   transformPropertyName: (sourcePropNameParts: string[]) => string;
// };
