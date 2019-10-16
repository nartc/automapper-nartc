import { Expose, ExposeOptions, Type, TypeHelpOptions, TypeOptions } from 'class-transformer';
import { AutoMapperBase } from './base';
import {
  ConditionPredicate,
  Configuration,
  Constructable,
  ConvertUsingOptions,
  CreateMapFluentFunctions,
  CreateReverseMapFluentFunctions,
  DestinationMemberConfigOptions,
  ForMemberExpression,
  MapActionOptions,
  MapFromCallback,
  Mapping,
  MappingProfile,
  MappingProperty,
  MapWithOptions
} from './types';

/**
 * Combined Expose and Type from class-transformer
 *
 * @param {(type?: TypeHelpOptions) => Function} typeFn
 * @param {ExposeOptions} exposeOptions
 * @param {TypeOptions} typeOptions
 */
export const ExposedType = (
  typeFn: (type?: TypeHelpOptions) => Function,
  exposeOptions?: ExposeOptions,
  typeOptions?: TypeOptions
): PropertyDecorator => (target: any, propertyKey) => {
  Expose(exposeOptions)(target, propertyKey as string);
  Type(typeFn, typeOptions)(target, propertyKey as string);
};

export class AutoMapper extends AutoMapperBase {
  private static _instance: AutoMapper = new AutoMapper();

  private readonly _profiles!: { [key: string]: MappingProfile };

  /**
   * @static - Get the Mapper instance
   */
  public static getInstance(): AutoMapper {
    return this._instance;
  }

  constructor() {
    super();
    this._profiles = {};
    if (!AutoMapper._instance) {
      AutoMapper._instance = this;
    }
  }

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
  public initialize(configFn: (config: Configuration) => void): void {
    const configuration: Configuration = {
      addProfile: (profile: MappingProfile): AutoMapper => {
        return this.addProfile(profile);
      },
      createMap: <TSource extends {} = any, TDestination extends {} = any>(
        source: Constructable<TSource>,
        destination: Constructable<TDestination>
      ): CreateMapFluentFunctions<TSource, TDestination> => {
        return this.createMap(source, destination);
      }
    };

    configFn(configuration);
  }

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
   * @param {Constructable<TDestination>} destination - the Destination model to receive the
   *   mapped values
   * @param {MapActionOptions<TSource, TDestination>} option - Optional mapping option
   */
  public map<TSource extends {} = any, TDestination extends {} = any>(
    sourceObj: TSource,
    destination: Constructable<TDestination>,
    option?: MapActionOptions<TSource, TDestination>
  ): TDestination {
    const mapping = super._getMappingForDestination<TSource, TDestination>(destination);
    return super._map(sourceObj, mapping, option);
  }

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
   * @param {Constructable<TDestination>} destination - the Destination model to receive the
   *   mapped values
   *
   * @param {MapActionOptions<TSource, TDestination>} option - Optional mapping option
   * @returns {Promise<TDestination>} Promise that resolves TDestination
   */
  public mapAsync<TSource extends {} = any, TDestination extends {} = any>(
    sourceObj: TSource,
    destination: Constructable<TDestination>,
    option?: MapActionOptions<TSource, TDestination>
  ): Promise<TDestination> {
    const mapping = super._getMappingForDestination<TSource, TDestination>(destination);
    return super._mapAsync(sourceObj, mapping, option);
  }

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
   * @param {Constructable<TDestination>} destination - the Destination model to receive the
   *   mapped values
   * @param {MapActionOptions<TSource, TDestination>} option - Optional mapping option
   */
  public mapArray<TSource extends {} = any, TDestination extends {} = any>(
    sourceObj: TSource[],
    destination: Constructable<TDestination>,
    option?: MapActionOptions<TSource[], TDestination[]>
  ): TDestination[] {
    const mapping = super._getMappingForDestination<TSource, TDestination>(destination);
    return super._mapArray(sourceObj, mapping, option);
  }

  /**
   * Map from a list of Source to a list of Destination async. Mapping operation will be run
   * as a micro task.
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
   * @param {Constructable<TDestination>} destination - the Destination model to receive the
   *   mapped values
   * @param {MapActionOptions<TSource, TDestination>} option - Optional mapping option
   * @returns {Promise<TDestination[]>>} Promise that resolves a TDestination[]
   */
  public mapArrayAsync<TSource extends {} = any, TDestination extends {} = any>(
    sourceObj: TSource[],
    destination: Constructable<TDestination>,
    option?: MapActionOptions<TSource[], TDestination[]>
  ): Promise<TDestination[]> {
    const mapping = super._getMappingForDestination<TSource, TDestination>(destination);
    return super._mapArrayAsync(sourceObj, mapping, option);
  }

  /**
   * Add MappingProfile to the current instance of AutoMapper
   *
   * @param {MappingProfile} profile - Profile being added
   */
  public addProfile(profile: MappingProfile): AutoMapper {
    if (this._profiles[profile.profileName]) {
      throw new Error(`${profile.profileName} is already existed on the current Mapper instance`);
    }

    profile.configure(this);
    this._profiles[profile.profileName] = Object.freeze(profile);
    return this;
  }

  /**
   * Create a mapping between Source and Destination without initializing the Mapper
   *
   * @param {Constructable<TSource>} source - the Source model
   * @param {Constructable<TDestination>} destination - the Destination model
   */
  public createMap<TSource extends {} = any, TDestination extends {} = any>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination> {
    const mapping = super._createMappingObject(source, destination);
    return this._createMappingFluentFunctions<TSource, TDestination>(mapping);
  }

  /**
   * Dispose Mappings and Profiles created on the Mapper singleton
   */
  public dispose(): void {
    Object.keys(this._profiles).forEach(key => {
      delete this._profiles[key];
    });
    super._dispose();
  }

  private _createMappingFluentFunctions<TSource extends {} = any, TDestination extends {} = any>(
    mapping: Mapping<TSource, TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination> {
    const fluentFunctions: CreateMapFluentFunctions<TSource, TDestination> = {
      forMember: (destinationKey, forMemberFn) => {
        return this._createMapForMember(mapping, destinationKey, forMemberFn, fluentFunctions);
      },
      reverseMap: () => {
        return this._createReverseMap(mapping);
      },
      beforeMap: action => {
        mapping.beforeMapAction = action;
        return fluentFunctions;
      },
      afterMap: action => {
        mapping.afterMapAction = action;
        return fluentFunctions;
      },
      setSourceNamingConvention: namingConvention => {
        mapping.sourceMemberNamingConvention = namingConvention;
        return fluentFunctions;
      },
      setDestinationNamingConvention: namingConvention => {
        mapping.destinationMemberNamingConvention = namingConvention;
        return fluentFunctions;
      }
    };

    return fluentFunctions;
  }

  private _createMapForMember<TSource extends {} = any, TDestination extends {} = any>(
    mapping: Mapping<TSource, TDestination>,
    key: keyof TDestination,
    fn: ForMemberExpression<TSource, TDestination>,
    fluentFunctions: CreateMapFluentFunctions<TSource, TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination> {
    const transformationType = super.getTransformationType(fn);
    let mapFrom: MapFromCallback<TSource, TDestination>;
    let condition: ConditionPredicate<TSource>;
    let fromValue: TDestination[keyof TDestination];
    let mapWith: MapWithOptions<TSource, TDestination>;
    let convertUsing: ConvertUsingOptions<TSource, TDestination>;

    const opts: DestinationMemberConfigOptions<TSource, TDestination> = {
      mapFrom: cb => {
        mapFrom = cb;
      },
      mapWith: (destination, value) => {
        mapWith = { destination, value };
      },
      condition: predicate => {
        condition = predicate;
      },
      ignore(): void {
        // do nothing
      },
      fromValue: value => {
        fromValue = value;
      },
      convertUsing: (converter, value) => {
        convertUsing = { converter, value };
      }
    };

    fn(opts);

    const mappingProperty: MappingProperty<TSource, TDestination> = {
      destinationKey: key,
      transformation: Object.freeze({
        transformationType,
        // @ts-ignore
        mapFrom,
        // @ts-ignore
        condition,
        // @ts-ignore
        fromValue,
        // @ts-ignore
        mapWith,
        // @ts-ignore
        convertUsing
      })
    };

    mapping.properties.set(key, Object.freeze(mappingProperty));

    return fluentFunctions;
  }

  private _createReverseMap<TSource extends {} = any, TDestination extends {} = any>(
    mapping: Mapping<TSource, TDestination>
  ): CreateReverseMapFluentFunctions<TDestination, TSource> {
    const reverseMapping = super._createReverseMappingObject(mapping);

    const reverseMapFluentFunctions: CreateReverseMapFluentFunctions<TDestination, TSource> = {
      forPath: (destination, forPathFn) => {
        const destinationKey = super._getKeyFromMemberFn(destination);
        return this._createMapForPath<TDestination, TSource>(
          reverseMapping,
          destinationKey,
          forPathFn,
          reverseMapFluentFunctions
        );
      }
    };

    return reverseMapFluentFunctions;
  }

  private _createMapForPath<TDestination extends {} = any, TSource extends {} = any>(
    mapping: Mapping<TDestination, TSource>,
    key: keyof TSource,
    fn: ForMemberExpression<TDestination, TSource>,
    fluentFunctions: CreateReverseMapFluentFunctions<TDestination, TSource>
  ): CreateReverseMapFluentFunctions<TDestination, TSource> {
    const transformationType = super.getTransformationType(fn);

    let mapFrom: MapFromCallback<TDestination, TSource>;
    let condition: ConditionPredicate<TDestination>;
    let fromValue: TSource[keyof TSource];
    let mapWith: MapWithOptions<TDestination, TSource>;
    let convertUsing: ConvertUsingOptions<TDestination, TSource>;

    const opts: DestinationMemberConfigOptions<TDestination, TSource> = {
      mapFrom: cb => {
        mapFrom = cb;
      },
      mapWith: (destination, value) => {
        mapWith = { destination, value };
      },
      condition: predicate => {
        condition = predicate;
      },
      ignore(): void {
        // do nothing
      },
      fromValue: value => {
        fromValue = value;
      },
      convertUsing: (converter, value) => {
        convertUsing = { converter, value };
      }
    };

    fn(opts);

    const mappingProperty: MappingProperty<TDestination, TSource> = {
      destinationKey: key,
      transformation: Object.freeze({
        transformationType,
        // @ts-ignore
        mapFrom,
        // @ts-ignore
        condition,
        // @ts-ignore
        fromValue,
        // @ts-ignore
        mapWith,
        // @ts-ignore
        convertUsing
      })
    };

    mapping.properties.set(key, Object.freeze(mappingProperty));
    return fluentFunctions;
  }
}

/**
 * Abstract class for all mapping Profiles
 *
 */
export abstract class MappingProfileBase implements MappingProfile {
  /**
   * @property {string} profileName - the name of the Profile
   */
  public profileName: string;

  /**
   * @constructor - initialize the profile with the profileName
   */
  protected constructor() {
    this.profileName = this.constructor.name;
  }

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
export const Mapper = AutoMapper.getInstance();
