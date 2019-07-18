declare module 'automapper-nartc/automapper' {
  import { AutoMapperBase } from 'automapper-nartc/base';
  import { Configuration, Constructable, CreateMapFluentFunctions, MappingProfile } from 'automapper-nartc/types';
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
  import { Constructable, ForMemberFunction, Mapping, TransformationType } from 'automapper-nartc/types';
  export abstract class AutoMapperBase {
      protected _mappingNames: {
          [key: string]: Constructable;
      };
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
      protected _createMappingObject<TSource extends {
          [key in keyof TSource]: any;
      } = any, TDestination extends {
          [key in keyof TDestination]: any;
      } = any>(source: Constructable<TSource>, destination: Constructable<TDestination>): Mapping<TSource, TDestination>;
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
declare module 'automapper-nartc/constants' {
  /** Used to compose unicode character classes. */
  export const rsAstralRange = "\\ud800-\\udfff";
  export const rsComboMarksRange = "\\u0300-\\u036f";
  export const reComboHalfMarksRange = "\\ufe20-\\ufe2f";
  export const rsComboSymbolsRange = "\\u20d0-\\u20ff";
  export const rsComboMarksExtendedRange = "\\u1ab0-\\u1aff";
  export const rsComboMarksSupplementRange = "\\u1dc0-\\u1dff";
  export const rsComboRange: string;
  export const rsDingbatRange = "\\u2700-\\u27bf";
  export const rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff";
  export const rsMathOpRange = "\\xac\\xb1\\xd7\\xf7";
  export const rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf";
  export const rsPunctuationRange = "\\u2000-\\u206f";
  export const rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000";
  export const rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde";
  export const rsVarRange = "\\ufe0e\\ufe0f";
  export const rsBreakRange: string;
  /** Used to compose unicode capture groups. */
  export const rsApos = "['\u2019]";
  export const rsBreak: string;
  export const rsCombo: string;
  export const rsDigit = "\\d";
  export const rsDingbat: string;
  export const rsLower: string;
  export const rsMisc: string;
  export const rsFitz = "\\ud83c[\\udffb-\\udfff]";
  export const rsModifier: string;
  export const rsNonAstral: string;
  export const rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
  export const rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
  export const rsUpper: string;
  export const rsZWJ = "\\u200d";
  /** Used to compose unicode regexes. */
  export const rsMiscLower: string;
  export const rsMiscUpper: string;
  export const rsOptContrLower: string;
  export const rsOptContrUpper: string;
  export const reOptMod: string;
  export const rsOptVar: string;
  export const rsOptJoin: string;
  export const rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])";
  export const rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])";
  export const rsSeq: string;
  export const rsEmoji: string;
  export const reQuotes: RegExp;
  export const reIsDeepProp: RegExp;
  export const reIsPlainProp: RegExp;
  /** Used as the maximum memoize cache size. */
  export const MAX_MEMOIZE_SIZE = 500;
  export const charCodeOfDot: number;
  export const reEscapeChar: RegExp;
  export const rePropName: RegExp;
  /** Used as references for various `Number` constants. */
  export const INFINITY: number;

}
declare module 'automapper-nartc/helpers' {

}
declare module 'automapper-nartc/index' {
  export * from 'automapper-nartc/base';
  export * from 'automapper-nartc/types';
  export * from 'automapper-nartc/automapper';

}
declare module 'automapper-nartc/internal' {
  export const unicodeWords: (string: string) => RegExpExecArray | null;
  export const asciiWords: (string: string) => RegExpExecArray | null;
  export const hasUnicodeWord: (string: string) => boolean;
  export const toString: () => string;
  export const getTag: (value: any) => string;
  export const isSymbol: (value: any) => boolean;
  export const isKey: (value: any, object: any) => boolean;
  interface InternalMemoizedFn {
      (...args: any[]): any;
      cache?: Map<any, any> | WeakMap<any, any> | any;
  }
  interface MemoizedFn {
      (fn: (...args: any[]) => any, resolve: (...args: any[]) => any): InternalMemoizedFn;
      Cache?: MapConstructor | WeakMapConstructor | any;
  }
  export const memoize: MemoizedFn;
  export const memoizedCapped: (fn: (...args: any[]) => any) => InternalMemoizedFn;
  export const stringToPath: InternalMemoizedFn;
  export const castPath: (value: any, object: any) => any;
  export const toKey: (value: any) => any;
  export const baseGet: (object: any, path: string) => any;
  export {};

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
      Condition = 2
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
      condition(predicate: ConditionPredicate<TSource>): void;
  }
  export interface ForMemberFunction<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any, K extends keyof TDestination = never> {
      (opts: DestinationMemberConfigOptions<TSource, TDestination, K>): void;
  }
  export interface CreateMapFluentFunctions<TSource extends {
      [key in keyof TSource]: any;
  } = any, TDestination extends {
      [key in keyof TDestination]: any;
  } = any> {
      forMember<K extends keyof TDestination>(destinationKey: K, forMemberFn: ForMemberFunction<TSource, TDestination, K>): CreateMapFluentFunctions<TSource, TDestination>;
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
      condition: ConditionPredicate<TSource>;
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
declare module 'automapper-nartc/utils' {
  export const toWords: (str: string, pattern?: string | RegExp | undefined) => RegExpMatchArray;
  export const toLowerCase: <TDestination>(str: keyof TDestination) => string;
  export const tryGet: (object: any, path: string, defaultValue?: any) => any;

}
declare module 'automapper-nartc' {
  import main = require('automapper-nartc/index');
  export = main;
}