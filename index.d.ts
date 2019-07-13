declare module 'automapper-nartc/automapper' {
  import { AutoMapperBase } from 'automapper-nartc/base';
  import { Configuration, Constructable, CreateMapFluentFunctions } from 'automapper-nartc/types';
  export class AutoMapper extends AutoMapperBase {
      private static _instance;
      private readonly _profiles;
      static getInstance(): AutoMapper;
      constructor();
      initialize(configFn: (config: Configuration) => void): void;
      map<TSource extends {} = any, TDestination extends {} = any>(source: Constructable<TSource>, destination: Constructable<TDestination>, sourceObj: TSource): TDestination;
      createMap<TSource extends {} = any, TDestination extends {} = any>(source: Constructable<TSource>, destination: Constructable<TDestination>): CreateMapFluentFunctions<TSource, TDestination>;
      private _createMappingFluentFunctions;
      private _createMapForMember;
  }
  export const Mapper: AutoMapper;

}
declare module 'automapper-nartc/base' {
  import { Constructable, ForMemberFunction, Mapping, TransformationType } from 'automapper-nartc/types';
  export abstract class AutoMapperBase {
      protected _mappingNames: {
          [key: string]: Constructable;
      };
      protected readonly _mappings: {
          [key: string]: Mapping;
      };
      protected constructor();
      protected getTransformationType<TSource extends {} = any, TDestination extends {} = any>(forMemberFn: ForMemberFunction<TSource, TDestination>): TransformationType;
      protected _map<TSource extends {} = any, TDestination extends {} = any>(sourceObj: TSource, mapping: Mapping<TSource, TDestination>): TDestination;
      protected _createMappingObject<TSource extends {} = any, TDestination extends {} = any>(source: Constructable<TSource>, destination: Constructable<TDestination>): Mapping<TSource, TDestination>;
      protected _getMapping<TSource, TDestination>(source: Constructable<TSource>, destination: Constructable<TDestination>): Mapping<TSource, TDestination>;
      private _hasMapping;
      private _getMappingKey;
      private _isClass;
      private _getMappingForNestedKey;
  }

}
declare module 'automapper-nartc/helpers' {

}
declare module 'automapper-nartc/index' {
  export * from 'automapper-nartc/base';
  export * from 'automapper-nartc/profile';
  export * from 'automapper-nartc/types';
  export * from 'automapper-nartc/automapper';

}
declare module 'automapper-nartc/naming/camel-case-naming-convention' {

}
declare module 'automapper-nartc/naming/pascal-case-naming-convention' {

}
declare module 'automapper-nartc/profile' {
  import { Constructable, MappingProfile, CreateMapFluentFunctions } from 'automapper-nartc/types';
  export abstract class MappingProfileBase implements MappingProfile {
      profileName: string;
      protected constructor();
      abstract configure(): void;
      protected createMap<TSource, TDestination>(source: Constructable<TSource>, destination: Constructable<TDestination>): CreateMapFluentFunctions<TSource, TDestination>;
  }

}
declare module 'automapper-nartc/types' {
  export enum TransformationType {
      Ignore = 0,
      MapFrom = 1,
      Condition = 2
  }
  export type Constructable<T extends {} = any> = new (...args: any[]) => T;
  export type MapFromCallback<TSource extends {} = any, TDestination extends {} = any, K extends keyof TDestination = never> = (source: TSource) => TDestination[K];
  export type ConditionPredicate<TSource extends {}> = (source: TSource) => boolean;
  export interface SourceMemberConfigOptions<TSource extends {} = any, TDestination extends {} = any> {
      ignore(): void;
  }
  export interface DestinationMemberConfigOptions<TSource extends {} = any, TDestination extends {} = any, K extends keyof TDestination = never> extends SourceMemberConfigOptions<TSource, TDestination> {
      mapFrom(cb: MapFromCallback<TSource, TDestination, K>): void;
      condition(predicate: ConditionPredicate<TSource>): void;
  }
  export interface ForMemberFunction<TSource extends {} = any, TDestination extends {} = any, K extends keyof TDestination = never> {
      (opts: DestinationMemberConfigOptions<TSource, TDestination, K>): void;
  }
  export interface CreateMapFluentFunctions<TSource extends {} = any, TDestination extends {} = any> {
      forMember<K extends keyof TDestination>(destinationKey: K, forMemberFn: ForMemberFunction<TSource, TDestination, K>): CreateMapFluentFunctions<TSource, TDestination>;
  }
  export interface Configuration {
      addProfile(profile: MappingProfile): void;
      createMap<TSource, TDestination>(source: Constructable<TSource>, destination: Constructable<TDestination>): CreateMapFluentFunctions<TSource, TDestination>;
  }
  export interface MappingTransformation<TSource extends {} = any, TDestination extends {} = any> {
      transformationType: TransformationType;
      mapFrom: (source: TSource) => ReturnType<MapFromCallback<TSource, TDestination>>;
      condition: ConditionPredicate<TSource>;
  }
  export interface MappingProperty<TSource extends {} = any, TDestination extends {} = any> {
      destinationKey: keyof TDestination;
      transformation: MappingTransformation<TSource, TDestination>;
  }
  export interface Mapping<TSource extends {} = any, TDestination extends {} = any> {
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

}
declare module 'automapper-nartc' {
  import main = require('automapper-nartc/index');
  export = main;
}