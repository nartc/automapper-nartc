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
  FromValue = 3
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
  configure: () => void;
}

// export enum DestinationTransformationType {
//   Constant = 1,
//   MemberOptions = 2,
//   AsyncMemberOptions = 4,
//   SourceMemberOptions = 8,
//   AsyncSourceMemberOptions = 16
// }
//
// export type Constructable<T> = new (...args: any[]) => T;
//
// export type MemberMappingMetadata<TSource, TDestination> = {
//   destination: keyof TDestination;
//   source: keyof TSource;
//   transformation: DestinationMappingTransformation<TSource, TDestination>;
//   sourceMapping: boolean;
//   ignore: boolean;
//   async: boolean;
//   condition?: ConditionPredicate<TSource>;
// };
//
// export type MappingProperty<TSource, TDestination> = {
//   name: string;
//   sourcePropertyName: keyof TSource;
//   destinationPropertyName: keyof TDestination;
//   level: number;
// };
//
// export type SourceMappingProperty<TSource, TDestination> = {
//   children: Array<SourceMappingProperty<TSource, TDestination>>;
//   destination?: DestinationMappingProperty<TSource, TDestination>;
// } & MappingProperty<TSource, TDestination>;
//
// export type DestinationMappingProperty<TSource, TDestination> = {
//   transformations: Array<DestinationMappingTransformation<TSource, TDestination>>;
//   ignore: boolean;
//   child?: DestinationMappingProperty<TSource, TDestination>;
//   conditionFn?: ConditionPredicate<TSource>;
//   sourceMapping: boolean;
// } & MappingProperty<TSource, TDestination>;
//
// export type DestinationMappingTransformation<TSource, TDestination> = {
//   transformationType: DestinationTransformationType;
//   constant?: ReturnType<ForMemberFn<TDestination>>;
//   memberConfigurationOptionsFn?: (opts: DestinationMemberConfigurationOptions<TSource, TDestination>) => void;
//   asyncMemberConfigurationOptionsFn?: (
//     opts: DestinationMemberConfigurationOptions<TSource, TDestination>,
//     cb: MemberCallback<TDestination>
//   ) => void;
//   sourceMemberConfigurationOptionsFn?: (opts: SourceMemberConfigurationOptions<TSource>) => void;
//   asyncSourceMemberConfigurationOptionsFn?: (
//     opts: SourceMemberConfigurationOptions<TSource>,
//     cb: MemberCallback<TSource>
//   ) => void;
// };
//
// export type MapItemFn<TSource, TDestination> = (
//   mapping: Mapping<TSource, TDestination>,
//   source: TSource,
//   destination: TDestination
// ) => TDestination;
//
// export type Mapping<TSource extends {} = any, TDestination extends {} = any> = {
//   sourceTypeClass: Constructable<TSource>;
//   destinationTypeClass: Constructable<TDestination>;
//   sourceKey: string;
//   destinationKey: string;
//   forAllMembersMappings: Array<ForAllMembersFn<TDestination>>;
//   properties: Array<SourceMappingProperty<TSource, TDestination>>;
//   /**
//    * TODO: To be implemented
//    */
//   typeConverterFn: any;
//   profile?: MappingProfile;
//   ignoreAllNonExisting?: boolean;
//   async: boolean;
//   mapItemFn: MapItemFn<TSource, TDestination>;
// };
//
// export type MapFromCallback<TSource, TDestination> = (source: TSource) => ReturnType<ForMemberFn<TDestination>>;
// export type ConditionPredicate<TSource> = (source: TSource) => boolean;
//
// export type MemberCallback<TDestination> = (cbValue: ReturnType<ForMemberFn<TDestination>>) => void;
//
// export type ForMemberFn<TDestination> = (destination: TDestination) => TDestination[keyof TDestination];
// export type ForSourceMemberFn<TSource> =
//   ((opts: SourceMemberConfigurationOptions<TSource>) => any)
//   | ((opts: SourceMemberConfigurationOptions<TSource>, cb: MemberCallback<TSource>) => any);
// export type ForMemberValueOrFunction<TSource, TDestination> = ReturnType<ForMemberFn<TDestination>>
//   | ((opts: DestinationMemberConfigurationOptions<TSource, TDestination>) => any)
//   | ((opts: DestinationMemberConfigurationOptions<TSource, TDestination>, cb: MemberCallback<TDestination>) => any);
// export type ForAllMembersFn<TDestination> = (source: TDestination, key: keyof TDestination, value: any) => void;
//
// export type MappingConfigurationOptions<TSource> = {
//   sourceObject: Partial<TSource>;
//   sourcePropertyName: keyof TSource;
//   intermediatePropertyValue?: any;
// }
//
// export type SourceMemberConfigurationOptions<TSource> = {
//   ignore: () => void;
// } & MappingConfigurationOptions<TSource>;
//
// export type DestinationMemberConfigurationOptions<TSource, TDestination> = {
//   mapFrom: (mapFromCb: MapFromCallback<TSource, TDestination>) => void;
//   condition: (predicate: ConditionPredicate<TSource>) => void;
// } & SourceMemberConfigurationOptions<TSource>;
//
// export type CreateMapFluentFunctions<TSource, TDestination> = {
//   forMember: (
//     forMemberFn: ForMemberFn<TDestination>,
//     valueOrFunction: ForMemberValueOrFunction<TSource, TDestination>
//   ) => CreateMapFluentFunctions<TSource, TDestination>;
//   forSourceMember: (
//     forSourceMemberFn: ForMemberFn<TSource>,
//     configFunction: ForSourceMemberFn<TSource>
//   ) => CreateMapFluentFunctions<TSource, TDestination>;
//   forAllMembers: (fn: ForAllMembersFn<TDestination>) => CreateMapFluentFunctions<TSource, TDestination>;
//   ignoreAllNonExisting: () => CreateMapFluentFunctions<TSource, TDestination>;
//   /**
//    * TODO: To be implemented
//    */
//   convertUsing: () => void;
//   convertToType: (typeClass: new () => TDestination) => CreateMapFluentFunctions<TSource, TDestination>;
//   withProfile: (profile: MappingProfile) => void;
// };
//
// export type NamingConvention = {
//   splittingExpression: RegExp;
//   separatorCharacter: string;
//   transformPropertyName: (sourcePropNameParts: string[]) => string;
// };
//
// export interface MappingProfile {
//   profileName: string;
//   sourceMemberNamingConvention: NamingConvention;
//   destinationMemberNamingConvention: NamingConvention;
//   configure: () => void;
// }
//
// export type Configuration = {
//   addProfile: (profile: MappingProfile) => void;
//   createMap: <TSource, TDestination>(
//     source: Constructable<TSource>,
//     destination: Constructable<TDestination>
//   ) => CreateMapFluentFunctions<TSource, TDestination>;
// };
