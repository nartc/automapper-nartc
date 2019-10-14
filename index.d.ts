declare module 'automapper-nartc/automapper' {
  import { ExposeOptions, TypeHelpOptions, TypeOptions } from 'class-transformer';
  import { AutoMapperBase } from 'automapper-nartc/base';
  import { Configuration, Constructable, CreateMapFluentFunctions, MappingProfile } from 'automapper-nartc/types';
  /**
   * Combined Expose and Type from class-transformer
   *
   * @param {(type?: TypeHelpOptions) => Function} typeFn
   * @param {ExposeOptions} exposeOptions
   * @param {TypeOptions} typeOptions
   */
  export const ExposedType: (typeFn: (type?: TypeHelpOptions | undefined) => Function, exposeOptions?: ExposeOptions | undefined, typeOptions?: TypeOptions | undefined) => PropertyDecorator;
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
       * @param {Constructable<TDestination>} destination - the Destination model to receive the mapped
       *   values
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
       * Map from Source to Destination Async. Mapping operation will be run as a micro task.
       *
       * @example
       *
       *
       * ```ts
       * const user = new User();
       * user.firstName = 'John';
       * user.lastName = 'Doe';
       *
       * const userVm = await Mapper.mapAsync(user, UserVm);
       * ```
       *
       * @param {TSource} sourceObj - the sourceObj that are going to be mapped
       * @param {Constructable<TDestination>} destination - the Destination model to receive the mapped
       *   values
       *
       * @returns {Promise<TDestination>} Promise that resolves TDestination
       */
      mapAsync<TSource extends {} = any, TDestination extends {} = any>(sourceObj: TSource, destination: Constructable<TDestination>): Promise<TDestination>;
      /**
       * Map from Source to Destination async
       *
       * @param {TSource} sourceObj - the sourceObj that are going to be mapped
       * @param {Constructable<TSource>} source - the Source model
       * @param {Constructable<TDestination>} destination - the Destination model
       * @returns {Promise<TDestination>} Promise that resolves TDestination
       */
      mapAsync<TSource extends {} = any, TDestination extends {} = any>(sourceObj: TSource, source: Constructable<TSource>, destination: Constructable<TDestination>): Promise<TDestination>;
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
       * @param {Constructable<TDestination>} destination - the Destination model to receive the mapped
       *   values
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
       * Map from a list of Source to a list of Destination async. Mapping operation will be run as a
       * micro task.
       *
       * @example
       *
       *
       * ```ts
       * const addresses = [];
       * addresses.push(new Address(), new Address());
       *
       * const addressesVm = await Mapper.mapArrayAsync(addresses, AddressVm);
       * ```
       *
       * @param {TSource} sourceObj - the sourceObj that are going to be mapped
       * @param {Constructable<TDestination>} destination - the Destination model to receive the mapped
       *   values
       *
       * @returns {Promise<TDestination[]>>} Promise that resolves a TDestination[]
       */
      mapArrayAsync<TSource extends {} = any, TDestination extends {} = any>(sourceObj: TSource[], destination: Constructable<TDestination>): Promise<TDestination[]>;
      /**
       * Map from a list of Source to a list of Destination async.
       *
       * @param {TSource} sourceObj - the sourceObj that are going to be mapped
       * @param {Constructable<TSource>} source - the Source model
       * @param {Constructable<TDestination>} destination - the Destination model
       *
       * @returns {Promise<TDestination[]>>} Promise that resolves a TDestination[]
       */
      mapArrayAsync<TSource extends {} = any, TDestination extends {} = any>(sourceObj: TSource[], source: Constructable<TSource>, destination: Constructable<TDestination>): Promise<TDestination[]>;
      /**
       * Add MappingProfile to the current instance of AutoMapper
       *
       * @param {MappingProfile} profile - Profile being added
       */
      addProfile(profile: MappingProfile): AutoMapper;
      /**
       * Create a mapping between Source and Destination without initializing the Mapper
       *
       * @param {Constructable<TSource>} source - the Source model
       * @param {Constructable<TDestination>} destination - the Destination model
       */
      createMap<TSource extends {} = any, TDestination extends {} = any>(source: Constructable<TSource>, destination: Constructable<TDestination>): CreateMapFluentFunctions<TSource, TDestination>;
      /**
       * Dispose Mappings and Profiles created on the Mapper singleton
       */
      dispose(): void;
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
       *
       * @param {AutoMapper} mapper - AutoMapper instance to add this Profile on
       */
      abstract configure(mapper: AutoMapper): void;
  }
  /**
   * @instance AutoMapper singleton
   */
  export const Mapper: AutoMapper;

}
declare module 'automapper-nartc/base' {
  import { Constructable, ForMemberExpression, ForPathDestinationFn, Mapping, TransformationType } from 'automapper-nartc/types';
  export abstract class AutoMapperBase {
      protected readonly _mappings: {
          [key: string]: Mapping;
      };
      protected constructor();
      protected getTransformationType<TSource extends {
          [key in keyof TSource]: any;
      } = any, TDestination extends {} = any>(forMemberFn: ForMemberExpression<TSource, TDestination>): TransformationType;
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
      protected _mapAsync<TSource extends {
          [key in keyof TSource]: any;
      } = any, TDestination extends {
          [key in keyof TDestination]: any;
      } = any>(sourceObj: TSource, mapping: Mapping<TSource, TDestination>): Promise<TDestination>;
      protected _mapArrayAsync<TSource extends {
          [key in keyof TSource]: any;
      } = any, TDestination extends {
          [key in keyof TDestination]: any;
      } = any>(sourceArray: TSource[], mapping: Mapping<TSource, TDestination>): Promise<TDestination[]>;
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
      protected _dispose(): void;
      private _hasMapping;
      private _getMappingKey;
      private _isClass;
      private _isDate;
      private _isArray;
      private _isResolver;
      private _getMappingForNestedKey;
  }

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
  import { AutoMapper } from 'automapper-nartc/automapper';
  export type Unpacked<T> = T extends (infer U)[] ? U : T extends (...args: any[]) => infer U ? U : T extends Promise<infer U> ? U : T;
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
  export type Constructable<T extends {
      [key in keyof T]: any;
  } = any> = new (...args: any[]) => T;
  export interface Converter<TSource, TDestination> {
      convert(source: TSource): TDestination;
  }
  export interface Resolver<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any, K extends keyof TDestination = never> {
      resolve(source: TSource, destination: TDestination, transformation: MappingTransformation<TSource, TDestination>): K;
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
  export type ValueSelector<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any, K extends keyof TDestination = never> = (source: TSource) => TDestination[K];
  export type MapFromCallback<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any, K extends keyof TDestination = never> = ValueSelector<TSource, TDestination, K> | Resolver<TSource, TDestination, K>;
  /**
   * Condition Predicate from a source
   */
  export type ConditionPredicate<TSource extends {
      [key in keyof TSource]: any;
  }> = (source: TSource) => boolean;
  /**
   * Options for mapWith
   */
  export type MapWithOptions<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any> = {
      destination: Constructable<Unpacked<TDestination[keyof TDestination]>>;
      value: ValueSelector<TSource>;
  };
  export type ConvertUsingOptions<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any> = {
      converter: Converter<TSource[keyof TSource], TDestination[keyof TDestination]>;
      value?: (source: TSource) => TSource[keyof TSource];
  };
  export interface DestinationMemberConfigOptions<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any, K extends keyof TDestination = never> {
      mapFrom(cb: MapFromCallback<TSource, TDestination, K>): void;
      mapWith(destination: Constructable<Unpacked<TDestination[K]>>, value: ValueSelector<TSource>): void;
      condition(predicate: ConditionPredicate<TSource>): void;
      fromValue(value: TDestination[K]): void;
      ignore(): void;
      convertUsing<TConvertSource extends TSource[keyof TSource], TConvertDestination extends TDestination[K]>(converter: Converter<TConvertSource, TConvertDestination>, value?: (source: TSource) => TConvertSource): void;
  }
  export interface ForMemberExpression<TSource extends {
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
      forPath<K extends keyof TSource>(destination: ForPathDestinationFn<TSource>, forPathFn: ForMemberExpression<TDestination, TSource, K>): CreateReverseMapFluentFunctions<TDestination, TSource>;
  }
  export interface CreateMapFluentFunctions<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any> {
      forMember<K extends keyof TDestination>(key: K, expression: ForMemberExpression<TSource, TDestination, K>): CreateMapFluentFunctions<TSource, TDestination>;
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
      mapFrom: MapFromCallback<TSource, TDestination>;
      mapWith: MapWithOptions<TSource, TDestination>;
      condition: ConditionPredicate<TSource>;
      fromValue: TDestination[keyof TDestination];
      convertUsing: ConvertUsingOptions<TSource, TDestination>;
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
      configure: (mapper: AutoMapper) => void;
  }

}
declare module 'automapper-nartc' {
  import main = require('automapper-nartc/index');
  export = main;
}