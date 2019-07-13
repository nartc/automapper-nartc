export enum TransformationType {
  Ignore = 0,
  MapFrom = 1,
  Condition = 2
}

export type Constructable<T extends {} = any> = new (...args: any[]) => T

export type MapFromCallback<
  TSource extends {} = any,
  TDestination extends {} = any,
  K extends keyof TDestination = TDestination[any]
> = (source: TSource) => TDestination[K]
export type ConditionPredicate<TSource extends {}> = (source: TSource) => boolean

export interface SourceMemberConfigOptions<
  TSource extends {} = any,
  TDestination extends {} = any
> {
  ignore(): void
}

export interface DestinationMemberConfigOptions<
  TSource extends {} = any,
  TDestination extends {} = any,
  K extends keyof TDestination = TDestination[any]
> extends SourceMemberConfigOptions<TSource, TDestination> {
  mapFrom(cb: MapFromCallback<TSource, TDestination, K>): void

  condition(predicate: ConditionPredicate<TSource>): void
}

/**
 * forMember('test', opts => opts.condition(s => s.isBoolean));
 */

export interface ForMemberFunction<
  TSource extends {} = any,
  TDestination extends {} = any,
  K extends keyof TDestination = TDestination[any]
> {
  (opts: DestinationMemberConfigOptions<TSource, TDestination, K>): void
}

export interface CreateMapFluentFunctions<TSource extends {} = any, TDestination extends {} = any> {
  forMember<K extends keyof TDestination>(
    destinationKey: K,
    forMemberFn: ForMemberFunction<TSource, TDestination, K>
  ): CreateMapFluentFunctions<TSource, TDestination>
}

export interface Configuration {
  addProfile(profile: any): void

  createMap<TSource, TDestination>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination>
}

export interface MappingTransformation<TSource extends {} = any, TDestination extends {} = any> {
  transformationType: TransformationType
  transformOptions: DestinationMemberConfigOptions<TSource, TDestination>
}

export interface MappingProperty<TSource extends {} = any, TDestination extends {} = any> {
  destinationKey: keyof TDestination
  transformation: MappingTransformation<TSource, TDestination>
}

export interface Mapping<TSource extends {} = any, TDestination extends {} = any> {
  source: Constructable<TSource>
  destination: Constructable<TDestination>
  sourceKey: string
  destinationKey: string
  properties: Array<MappingProperty<TSource, TDestination>>
}
