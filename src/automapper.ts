import { Expose, ExposeOptions, Type, TypeHelpOptions, TypeOptions } from 'class-transformer';
import { AutoMapperBase } from './base';
import {
  ConditionPredicate,
  Configuration,
  Constructable,
  CreateMapFluentFunctions,
  CreateReverseMapFluentFunctions,
  DestinationMemberConfigOptions,
  ForMemberFunction,
  MapFromCallback,
  Mapping,
  MappingProfile,
  MappingProperty,
  Unpacked
} from './types';

/**
 *
 * @param {ExposeOptions} exposeOptions
 * @param {TypeOptions} typeOptions
 * @deprecated Please use `@ExposedType()` instead.
 */
export const MapInitialize = (
  exposeOptions?: ExposeOptions,
  typeOptions?: TypeOptions
): PropertyDecorator => (target: any, propertyKey) => {
  const type = (Reflect as any).getMetadata('design:type', target, propertyKey);

  if (
    !Object.keys(Object.getPrototypeOf(target)).length &&
    Object.getPrototypeOf(target).constructor.name === 'Object'
  ) {
    target[propertyKey] = new type();
    ExposedType(() => type, exposeOptions, typeOptions)(target, propertyKey);
  } else {
    const ctor = new target.constructor();
    ctor[propertyKey] = new type();
    ExposedType(() => type, exposeOptions, typeOptions)(ctor, propertyKey as any);
  }
};

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

  private readonly _profiles!: { [key: string]: any };

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
      addProfile: (profile: MappingProfile): void => {
        profile.configure();
        this._profiles[profile.profileName] = profile;
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
   * @param {Constructable<TDestination>} destination - the Destination model to receive the mapped values
   */
  public map<TSource extends {} = any, TDestination extends {} = any>(
    sourceObj: TSource,
    destination: Constructable<TDestination>
  ): TDestination;
  /**
   * Map from Source to Destination
   *
   * @param {TSource} sourceObj - the sourceObj that are going to be mapped
   * @param {Constructable<TSource>} source - the Source model
   * @param {Constructable<TDestination>} destination - the Destination model
   */
  public map<TSource extends {} = any, TDestination extends {} = any>(
    sourceObj: TSource,
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): TDestination;
  public map<TSource extends {} = any, TDestination extends {} = any>(
    sourceObj: TSource,
    ...args: Constructable<TSource | TDestination>[]
  ) {
    if (args.length === 2) {
      const mapping = super._getMapping(args[0] as Constructable<TSource>, args[1]);
      return super._map(sourceObj, mapping);
    }

    const mapping = super._getMappingForDestination<TSource, TDestination>(args[0] as Constructable<
      TDestination
    >);
    return super._map(sourceObj, mapping);
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
   * @param {Constructable<TDestination>} destination - the Destination model to receive the mapped values
   */
  public mapArray<TSource extends {} = any, TDestination extends {} = any>(
    sourceObj: TSource[],
    destination: Constructable<TDestination>
  ): TDestination[];
  /**
   * Map from a list of Source to a list of Destination
   *
   * @param {TSource} sourceObj - the sourceObj that are going to be mapped
   * @param {Constructable<TSource>} source - the Source model
   * @param {Constructable<TDestination>} destination - the Destination model
   */
  public mapArray<TSource extends {} = any, TDestination extends {} = any>(
    sourceObj: TSource[],
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): TDestination[];
  public mapArray<TSource extends {} = any, TDestination extends {} = any>(
    sourceObj: TSource[],
    ...args: Constructable<TSource | TDestination>[]
  ): TDestination[] {
    if (args.length === 2) {
      const mapping = super._getMapping(
        args[0] as Constructable<TSource>,
        args[1] as Constructable<TDestination>
      );
      return super._mapArray(sourceObj, mapping);
    }

    const mapping = super._getMappingForDestination<TSource, TDestination>(args[0] as Constructable<
      TDestination
    >);
    return super._mapArray(sourceObj, mapping);
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
      }
    };

    return fluentFunctions;
  }

  private _createMapForMember<TSource extends {} = any, TDestination extends {} = any>(
    mapping: Mapping<TSource, TDestination>,
    key: keyof TDestination,
    fn: ForMemberFunction<TSource, TDestination>,
    fluentFunctions: CreateMapFluentFunctions<TSource, TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination> {
    const transformationType = super.getTransformationType(fn);
    let mapFrom: MapFromCallback<TSource, TDestination>;
    let condition: ConditionPredicate<TSource>;
    let fromValue: TDestination[keyof TDestination];
    let mapWith: Constructable<Unpacked<TDestination[keyof TDestination]>>;

    const opts: DestinationMemberConfigOptions<TSource, TDestination> = {
      mapFrom: cb => {
        mapFrom = cb;
      },
      mapWith: destination => {
        mapWith = destination;
      },
      condition: predicate => {
        condition = predicate;
      },
      ignore(): void {
        // do nothing
      },
      fromValue: value => {
        fromValue = value;
      }
    };

    fn(opts);

    const mappingProperty: MappingProperty<TSource, TDestination> = {
      destinationKey: key,
      transformation: {
        transformationType,
        // @ts-ignore
        mapFrom,
        // @ts-ignore
        condition,
        // @ts-ignore
        fromValue,
        // @ts-ignore
        mapWith
      }
    };

    mapping.properties.set(key, mappingProperty);

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
    fn: ForMemberFunction<TDestination, TSource>,
    fluentFunctions: CreateReverseMapFluentFunctions<TDestination, TSource>
  ): CreateReverseMapFluentFunctions<TDestination, TSource> {
    const transformationType = super.getTransformationType(fn);

    let mapFrom: MapFromCallback<TDestination, TSource>;
    let condition: ConditionPredicate<TDestination>;
    let fromValue: TSource[keyof TSource];
    let mapWith: Constructable<Unpacked<TSource[keyof TSource]>>;

    const opts: DestinationMemberConfigOptions<TDestination, TSource> = {
      mapFrom: cb => {
        mapFrom = cb;
      },
      mapWith: destination => {
        mapWith = destination;
      },
      condition: predicate => {
        condition = predicate;
      },
      ignore(): void {
        // do nothing
      },
      fromValue: value => {
        fromValue = value;
      }
    };

    fn(opts);

    const mappingProperty: MappingProperty<TDestination, TSource> = {
      destinationKey: key,
      transformation: {
        transformationType,
        // @ts-ignore
        mapFrom,
        // @ts-ignore
        condition,
        // @ts-ignore
        fromValue,
        // @ts-ignore
        mapWith
      }
    };

    mapping.properties.set(key, mappingProperty);
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
   */
  abstract configure(): void;

  /**
   * Profile's createMap. Call this.createMap in configure() to setup mapping between a Source and a Destination
   *
   * @param {Constructable<TSource>} source - the Source model
   * @param {Constructable<TDestination>} destination - the Destination model
   */
  protected createMap<TSource, TDestination>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination> {
    return Mapper.createMap(source, destination);
  }
}

/**
 * @instance AutoMapper singleton
 */
export const Mapper = AutoMapper.getInstance();
