declare module 'automapper-nartc/automapper' {
  import 'reflect-metadata';
  import { ExposeOptions, TypeOptions } from 'class-transformer';
  import { AutoMapperBase } from 'automapper-nartc/base';
  import { Configuration, Constructable, CreateMapFluentFunctions, MappingProfile } from 'automapper-nartc/types';
  export const MapInitialize: (exposeOptions?: ExposeOptions | undefined, typeOptions?: TypeOptions | undefined) => PropertyDecorator;
  export class AutoMapper extends AutoMapperBase {
      private static _instance;
      private readonly _profiles;
      /**
       * @static - Get the Mapper instance
       */
      static getInstance(): AutoMapper;
      constructor();
      /**
       * Initialize Mapper
       *
       * @example
       *
       *
       * ```ts
       * Mapper.initialize(config => {
       *   config.addProfile(new Profile());
       *   config.createMap(Source, Destination);
       * })
       * ```
       *
       * @param {(config: Configuration) => void} configFn - Config function callback
       *
       */
      initialize(configFn: (config: Configuration) => void): void;
      /**
       * Map from Source to Destination
       *
       * @example
       *
       *
       * ```ts
       * const user = new User();
       * user.firstName = 'John';
       * user.lastName = 'Doe';
       *
       * const userVm = Mapper.map(user, UserVm);
       * ```
       *
       * @param {TSource} sourceObj - the sourceObj that are going to be mapped
       * @param {Constructable<TDestination>} destination - the Destination model to receive the mapped values
       */
      map<TSource extends {} = any, TDestination extends {} = any>(sourceObj: TSource, destination: Constructable<TDestination>): TDestination;
      /**
       * Map from Source to Destination
       *
       * @param {TSource} sourceObj - the sourceObj that are going to be mapped
       * @param {Constructable<TSource>} source - the Source model
       * @param {Constructable<TDestination>} destination - the Destination model
       */
      map<TSource extends {} = any, TDestination extends {} = any>(sourceObj: TSource, source: Constructable<TSource>, destination: Constructable<TDestination>): TDestination;
      /**
       * Map from a list of Source to a list of Destination
       *
       * @example
       *
       *
       * ```ts
       * const addresses = [];
       * addresses.push(new Address(), new Address());
       *
       * const addressesVm = Mapper.mapArray(addresses, AddressVm);
       * ```
       *
       * @param {TSource} sourceObj - the sourceObj that are going to be mapped
       * @param {Constructable<TDestination>} destination - the Destination model to receive the mapped values
       */
      mapArray<TSource extends {} = any, TDestination extends {} = any>(sourceObj: TSource[], destination: Constructable<TDestination>): TDestination[];
      /**
       * Map from a list of Source to a list of Destination
       *
       * @param {TSource} sourceObj - the sourceObj that are going to be mapped
       * @param {Constructable<TSource>} source - the Source model
       * @param {Constructable<TDestination>} destination - the Destination model
       */
      mapArray<TSource extends {} = any, TDestination extends {} = any>(sourceObj: TSource[], source: Constructable<TSource>, destination: Constructable<TDestination>): TDestination[];
      /**
       * Create a mapping between Source and Destination without initializing the Mapper
       *
       * @param {Constructable<TSource>} source - the Source model
       * @param {Constructable<TDestination>} destination - the Destination model
       */
      createMap<TSource extends {} = any, TDestination extends {} = any>(source: Constructable<TSource>, destination: Constructable<TDestination>): CreateMapFluentFunctions<TSource, TDestination>;
      private _createMappingFluentFunctions;
      private _createMapForMember;
      private _createReverseMap;
      private _createMapForPath;
  }
  /**
   * Abstract class for all mapping Profiles
   *
   */
  export abstract class MappingProfileBase implements MappingProfile {
      /**
       * @property {string} profileName - the name of the Profile
       */
      profileName: string;
      /**
       * @constructor - initialize the profile with the profileName
       */
      protected constructor();
      /**
       * @abstract configure() method to be called when using with Mapper.initialize()
       */
      abstract configure(): void;
      /**
       * Profile's createMap. Call this.createMap in configure() to setup mapping between a Source and a Destination
       *
       * @param {Constructable<TSource>} source - the Source model
       * @param {Constructable<TDestination>} destination - the Destination model
       */
      protected createMap<TSource, TDestination>(source: Constructable<TSource>, destination: Constructable<TDestination>): CreateMapFluentFunctions<TSource, TDestination>;
  }
  /**
   * @instance AutoMapper singleton
   */
  export const Mapper: AutoMapper;

}
declare module 'automapper-nartc/base' {
  import { Constructable, ForMemberFunction, ForPathDestinationFn, Mapping, TransformationType } from 'automapper-nartc/types';
  export abstract class AutoMapperBase {
      protected readonly _mappings: {
          [key: string]: Mapping;
      };
      protected constructor();
      protected getTransformationType<TSource extends {
          [key in keyof TSource]: any;
      } = any, TDestination extends {} = any>(forMemberFn: ForMemberFunction<TSource, TDestination>): TransformationType;
      protected _mapArray<TSource extends {
          [key in keyof TSource]: any;
      } = any, TDestination extends {
          [key in keyof TDestination]: any;
      } = any>(sourceArray: TSource[], mapping: Mapping<TSource, TDestination>): TDestination[];
      protected _map<TSource extends {
          [key in keyof TSource]: any;
      } = any, TDestination extends {
          [key in keyof TDestination]: any;
      } = any>(sourceObj: TSource, mapping: Mapping<TSource, TDestination>): TDestination;
      private _assertMappingErrors;
      protected _createMappingObject<TSource extends {
          [key in keyof TSource]: any;
      } = any, TDestination extends {
          [key in keyof TDestination]: any;
      } = any>(source: Constructable<TSource>, destination: Constructable<TDestination>): Mapping<TSource, TDestination>;
      protected _createReverseMappingObject<TSource extends {
          [key in keyof TSource]: any;
      } = any, TDestination extends {
          [key in keyof TDestination]: any;
      } = any>(mapping: Mapping<TSource, TDestination>): Mapping<TDestination, TSource>;
      protected _getKeyFromMemberFn<T extends {
          [key in keyof T]: any;
      } = any>(fn: ForPathDestinationFn<T>): keyof T;
      protected _getMapping<TSource, TDestination>(source: Constructable<TSource>, destination: Constructable<TDestination>): Mapping<TSource, TDestination>;
      protected _getMappingForDestination<TSource, TDestination>(destination: Constructable<TDestination>): Mapping<TSource, TDestination>;
      private _hasMapping;
      private _getMappingKey;
      private _isClass;
      private _isDate;
      private _isArray;
      private _getMappingForNestedKey;
  }

}
declare module 'automapper-nartc/helpers' {

}
declare module 'automapper-nartc/index' {
  export * from 'automapper-nartc/base';
  export * from 'automapper-nartc/types';
  export * from 'automapper-nartc/automapper';

}
declare module 'automapper-nartc/naming/camel-case-naming-convention' {

}
declare module 'automapper-nartc/naming/pascal-case-naming-convention' {

}
declare module 'automapper-nartc/types' {
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
  export type Constructable<T extends {
      [key in keyof T]: any;
  } = any> = new (...args: any[]) => T;
  export type MapFromCallback<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any, K extends keyof TDestination = never> = (source: TSource) => TDestination[K];
  export type ConditionPredicate<TSource extends {
      [key in keyof TSource]: any;
  }> = (source: TSource) => boolean;
  export interface SourceMemberConfigOptions<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any> {
      ignore(): void;
  }
  export interface DestinationMemberConfigOptions<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any, K extends keyof TDestination = never> extends SourceMemberConfigOptions<TSource, TDestination> {
      mapFrom(cb: MapFromCallback<TSource, TDestination, K>): void;
      mapWith(destination: Constructable<TDestination[K]>): void;
      condition(predicate: ConditionPredicate<TSource>): void;
      fromValue(value: TDestination[K]): void;
  }
  export interface ForMemberFunction<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any, K extends keyof TDestination = never> {
      (opts: DestinationMemberConfigOptions<TSource, TDestination, K>): void;
  }
  export type ForPathDestinationFn<TDestination extends {
      [key in keyof TDestination]: any;
  } = any> = (destination: TDestination) => TDestination[keyof TDestination];
  export interface CreateReverseMapFluentFunctions<TDestination extends {
      [key in keyof TDestination]: any;
  } = any, TSource extends {
      [key in keyof TSource]: any;
  } = any> {
      forPath<K extends keyof TSource>(destination: ForPathDestinationFn<TSource>, forPathFn: ForMemberFunction<TDestination, TSource, K>): CreateReverseMapFluentFunctions<TDestination, TSource>;
  }
  export interface CreateMapFluentFunctions<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any> {
      forMember<K extends keyof TDestination>(destinationKey: K, forMemberFn: ForMemberFunction<TSource, TDestination, K>): CreateMapFluentFunctions<TSource, TDestination>;
      reverseMap(): CreateReverseMapFluentFunctions<TDestination, TSource>;
  }
  export interface Configuration {
      addProfile(profile: MappingProfile): void;
      createMap<TSource, TDestination>(source: Constructable<TSource>, destination: Constructable<TDestination>): CreateMapFluentFunctions<TSource, TDestination>;
  }
  export interface MappingTransformation<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any> {
      transformationType: TransformationType;
      mapFrom: (source: TSource) => ReturnType<MapFromCallback<TSource, TDestination>>;
      mapWith: Constructable<TDestination[keyof TDestination]>;
      condition: ConditionPredicate<TSource>;
      fromValue: TDestination[keyof TDestination];
  }
  export interface MappingProperty<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any> {
      destinationKey: keyof TDestination;
      transformation: MappingTransformation<TSource, TDestination>;
  }
  export interface Mapping<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any> {
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