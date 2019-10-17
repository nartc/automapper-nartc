import { plainToClass } from 'class-transformer';
import get from 'lodash.get';
import isEmpty from 'lodash.isempty';
import { CamelCaseNamingConvention } from './naming/camel-case-naming-convention';
import {
  Constructable,
  ForMemberExpression,
  ForPathDestinationFn,
  MapActionOptions,
  MapFromCallback,
  Mapping,
  NamingConvention,
  Resolver,
  TransformationType,
  ValueSelector
} from './types';

export abstract class AutoMapperBase {
  protected readonly _mappings!: { [key: string]: Mapping };

  protected constructor() {
    this._mappings = {};
  }

  protected getTransformationType<
    TSource extends { [key in keyof TSource]: any } = any,
    TDestination extends {} = any
  >(forMemberFn: ForMemberExpression<TSource, TDestination>): TransformationType {
    const fnString = forMemberFn.toString();
    if (fnString.includes('ignore')) {
      return TransformationType.Ignore;
    }

    if (fnString.includes('condition')) {
      return TransformationType.Condition;
    }

    if (fnString.includes('fromValue')) {
      return TransformationType.FromValue;
    }

    if (fnString.includes('mapWith')) {
      return TransformationType.MapWith;
    }

    if (fnString.includes('convertUsing')) {
      return TransformationType.ConvertUsing;
    }

    return TransformationType.MapFrom;
  }

  protected _mapArray<
    TSource extends { [key in keyof TSource]: any } = any,
    TDestination extends { [key in keyof TDestination]: any } = any
  >(
    sourceArray: TSource[],
    mapping: Mapping<TSource, TDestination>,
    option: MapActionOptions<TSource[], TDestination[]> = {
      beforeMap: undefined,
      afterMap: undefined
    }
  ): TDestination[] {
    let destination: TDestination[] = [];
    const { beforeMap, afterMap } = option;

    if (beforeMap) {
      beforeMap(sourceArray, destination, { ...mapping });
    }

    destination = sourceArray.map(s => this._map(s, mapping, {}, true));

    if (afterMap) {
      afterMap(sourceArray, destination, { ...mapping });
    }

    return destination;
  }

  protected _map<
    TSource extends { [key in keyof TSource]: any } = any,
    TDestination extends { [key in keyof TDestination]: any } = any
  >(
    sourceObj: TSource,
    mapping: Mapping<TSource, TDestination>,
    option: MapActionOptions<TSource, TDestination> = { beforeMap: undefined, afterMap: undefined },
    isArrayMap: boolean = false
  ): TDestination {
    sourceObj = plainToClass(mapping.source, sourceObj);
    const { beforeMap, afterMap } = option;
    const {
      destination,
      properties,
      afterMapAction,
      beforeMapAction,
      sourceMemberNamingConvention,
      destinationMemberNamingConvention
    } = mapping;
    const destinationObj = plainToClass(destination, new destination());
    const configProps = [...properties.keys()];

    const destinationKeys = Object.keys(destinationObj);
    const destinationKeysLen = destinationKeys.length;

    if (!isArrayMap) {
      if (beforeMap) {
        beforeMap(sourceObj, destinationObj, { ...mapping });
      } else if (beforeMapAction) {
        beforeMapAction(sourceObj, destinationObj, { ...mapping });
      }
    }

    for (let i = 0; i < destinationKeysLen; i++) {
      const key = destinationKeys[i] as keyof TDestination;
      const sourceKey = AutoMapperBase._getSourcePropertyKey(
        destinationMemberNamingConvention,
        sourceMemberNamingConvention,
        key as string
      );
      if (configProps.includes(key)) {
        continue;
      }

      // customerName -> CustomerName
      // CustomerName -> Customer Name
      if (!sourceObj.hasOwnProperty(sourceKey)) {
        const keys = sourceKey
          .split(sourceMemberNamingConvention.splittingExpression)
          .filter(Boolean);
        if (keys.length === 1 || !sourceObj.hasOwnProperty(keys[0])) {
          continue;
        }

        const flatten = get(sourceObj, keys.join('.'));
        if (typeof flatten === 'object') {
          continue;
        }
        destinationObj[key] = flatten;
        continue;
      }

      const sourceVal: TSource[keyof TSource] = sourceObj[sourceKey as keyof TSource];
      if (sourceVal === undefined || sourceVal === null) {
        delete destinationObj[key];
        continue;
      }

      if (typeof sourceVal === 'object') {
        if (AutoMapperBase._isDate(sourceVal)) {
          destinationObj[key] = new Date(sourceVal) as TDestination[keyof TDestination];
          continue;
        }

        if (AutoMapperBase._isArray(sourceVal)) {
          if (isEmpty(sourceVal[0])) {
            destinationObj[key] = [] as any;
            continue;
          }

          if (typeof sourceVal[0] !== 'object') {
            destinationObj[key] = sourceVal.slice();
            continue;
          }

          const nestedMapping = this._getMappingForNestedKey<
            TSource[keyof TSource],
            TDestination[keyof TDestination]
          >(sourceVal[0]);
          destinationObj[key] = this._mapArray(sourceVal, nestedMapping) as any;
          continue;
        }
      }

      if (
        (typeof sourceVal === 'object' || typeof sourceVal === 'function') &&
        AutoMapperBase._isClass(sourceVal)
      ) {
        const nestedMapping = this._getMappingForNestedKey<
          TSource[keyof TSource],
          TDestination[keyof TDestination]
        >(sourceVal);
        destinationObj[key] = this._map(sourceVal, nestedMapping);
        continue;
      }

      destinationObj[key] = sourceVal;
    }

    const propKeys: Array<keyof TDestination> = [];
    for (let prop of properties.values()) {
      propKeys.push(prop.destinationKey);
      const propSourceKey = AutoMapperBase._getSourcePropertyKey(
        destinationMemberNamingConvention,
        sourceMemberNamingConvention,
        prop.destinationKey as string
      );
      if (prop.transformation.transformationType === TransformationType.Ignore) {
        destinationObj[prop.destinationKey] = null as any;
        continue;
      }

      if (prop.transformation.transformationType === TransformationType.Condition) {
        const condition = prop.transformation.condition(sourceObj);
        if (condition) {
          destinationObj[prop.destinationKey] = (sourceObj as any)[propSourceKey] || null;
          console.warn(`${propSourceKey} does not exist on ${mapping.source}`);
        }
        continue;
      }

      if (prop.transformation.transformationType === TransformationType.FromValue) {
        destinationObj[prop.destinationKey] = prop.transformation.fromValue;
        continue;
      }

      if (prop.transformation.transformationType === TransformationType.MapWith) {
        const _mapping = this._getMappingForDestination(prop.transformation.mapWith.destination);
        const _source = prop.transformation.mapWith.value(sourceObj);

        if (isEmpty(_source)) {
          console.warn(`${propSourceKey} does not exist on ${_mapping.source}`);
          destinationObj[prop.destinationKey] = null as any;
          continue;
        }

        if (!AutoMapperBase._isClass(_source)) {
          console.warn(
            `${prop.destinationKey} is type ${prop.transformation.mapWith.destination.name} but ${_source} is a primitive. No mapping was executed`
          );
          destinationObj[prop.destinationKey] = null as any;
          continue;
        }

        if (AutoMapperBase._isArray(_source)) {
          destinationObj[prop.destinationKey] = isEmpty(_source[0])
            ? []
            : (this._mapArray(_source, _mapping as Mapping) as any);
          continue;
        }

        destinationObj[prop.destinationKey] = this._map(_source, _mapping as Mapping);
        continue;
      }

      if (prop.transformation.transformationType === TransformationType.ConvertUsing) {
        const { converter, value } = prop.transformation.convertUsing;
        if (value == null) {
          const _source = (sourceObj as any)[propSourceKey];

          if (_source == null) {
            console.warn(`${propSourceKey} does not exist on ${mapping.source}`);
            destinationObj[prop.destinationKey] = null as any;
            continue;
          }

          destinationObj[prop.destinationKey] = converter.convert(_source);
          continue;
        }

        destinationObj[prop.destinationKey] = converter.convert(value(sourceObj));
        continue;
      }

      if (AutoMapperBase._isResolver(prop.transformation.mapFrom)) {
        destinationObj[prop.destinationKey] = prop.transformation.mapFrom.resolve(
          sourceObj,
          destinationObj,
          prop.transformation
        );
        continue;
      }

      destinationObj[prop.destinationKey] = (prop.transformation.mapFrom as ValueSelector)(
        sourceObj
      );
    }

    AutoMapperBase._assertMappingErrors(destinationObj, propKeys);

    if (!isArrayMap) {
      if (afterMap) {
        afterMap(sourceObj, destinationObj, { ...mapping });
      } else if (afterMapAction) {
        afterMapAction(sourceObj, destinationObj, { ...mapping });
      }
    }

    return destinationObj;
  }

  protected _mapAsync<
    TSource extends { [key in keyof TSource]: any } = any,
    TDestination extends { [key in keyof TDestination]: any } = any
  >(
    sourceObj: TSource,
    mapping: Mapping<TSource, TDestination>,
    option: MapActionOptions<TSource, TDestination> = {
      beforeMap: undefined,
      afterMap: undefined
    }
  ): Promise<TDestination> {
    return Promise.resolve().then(() => this._map(sourceObj, mapping, option));
  }

  protected _mapArrayAsync<
    TSource extends { [key in keyof TSource]: any } = any,
    TDestination extends { [key in keyof TDestination]: any } = any
  >(
    sourceArray: TSource[],
    mapping: Mapping<TSource, TDestination>,
    option: MapActionOptions<TSource[], TDestination[]> = {
      beforeMap: undefined,
      afterMap: undefined
    }
  ): Promise<TDestination[]> {
    return Promise.resolve().then(() => this._mapArray(sourceArray, mapping, option));
  }

  private static _assertMappingErrors<T extends { [key in keyof T]: any } = any>(
    obj: T,
    propKeys: Array<keyof T>
  ): void {
    const keys = Object.keys(obj);
    const unmappedKeys: string[] = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (propKeys.includes(key as keyof T)) {
        continue;
      }
      (obj[key as keyof T] === null || obj[key as keyof T] === undefined) && unmappedKeys.push(key);
    }

    if (unmappedKeys.length) {
      throw new Error(`The following keys are unmapped on ${obj.constructor.name || ''}:
      ----------------------------
      ${unmappedKeys.join('\n')}
      `);
    }
  }

  protected _createMappingObject<
    TSource extends { [key in keyof TSource]: any } = any,
    TDestination extends { [key in keyof TDestination]: any } = any
  >(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): Mapping<TSource, TDestination> {
    const key = this._hasMapping(source, destination);

    const mapping: Mapping<TSource, TDestination> = {
      source,
      destination,
      sourceKey: source.name,
      destinationKey: destination.name,
      properties: new Map(),
      sourceMemberNamingConvention: new CamelCaseNamingConvention(),
      destinationMemberNamingConvention: new CamelCaseNamingConvention()
    };

    this._mappings[key] = mapping;
    return mapping;
  }

  protected _createReverseMappingObject<
    TSource extends { [key in keyof TSource]: any } = any,
    TDestination extends { [key in keyof TDestination]: any } = any
  >(mapping: Mapping<TSource, TDestination>): Mapping<TDestination, TSource> {
    const key = this._hasMapping(mapping.destination, mapping.source);
    const reverseMapping = {
      source: mapping.destination,
      destination: mapping.source,
      sourceKey: mapping.destination.name,
      destinationKey: mapping.source.name,
      properties: new Map(),
      sourceMemberNamingConvention: mapping.destinationMemberNamingConvention,
      destinationMemberNamingConvention: mapping.sourceMemberNamingConvention
    };

    // TODO: Implement reverse nested mapping
    // if (mapping.properties.size) {
    //   for (const prop of mapping.properties.values()) {
    //     const keys = lowerCase(prop.destinationKey as string).split(' ');
    //     if (keys.length <= 1) {
    //       continue;
    //     }
    //
    //     const mappingProperty: MappingProperty<TDestination, TSource> = {
    //       destinationKey: keys.join('.') as keyof TDestination,
    //       transformation: {
    //         transformationType: TransformationType.FromValue,
    //         fromValue:
    //       }
    //     };
    //   }
    // }

    this._mappings[key] = Object.freeze(reverseMapping);

    return reverseMapping;
  }

  // TODO: This is not right.
  protected _getKeyFromMemberFn<T extends { [key in keyof T]: any } = any>(
    fn: ForPathDestinationFn<T>
  ): keyof T {
    return fn.toString().includes('function')
      ? ((fn
          .toString()
          .split('return')
          .pop() as string)
          .replace(/[};]/gm, '')
          .trim()
          .split('.')
          .pop() as keyof T)
      : ((fn
          .toString()
          .split('=>')
          .pop() as string)
          .trim()
          .split('.')
          .pop() as keyof T);
  }

  protected _getMapping<TSource, TDestination>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): Mapping<TSource, TDestination> {
    const sourceName = source.prototype.constructor.name;
    const destinationName = destination.prototype.constructor.name;
    const mapping = this._mappings[AutoMapperBase._getMappingKey(sourceName, destinationName)];

    if (!mapping) {
      throw new Error(
        `Mapping not found for source ${sourceName} and destination ${destinationName}`
      );
    }

    return mapping;
  }

  protected _getMappingForDestination<TSource, TDestination>(
    destination: Constructable<TDestination>
  ): Mapping<TSource, TDestination> {
    const destinationName = destination.prototype.constructor.name;
    const sourceKey = Object.keys(this._mappings)
      .filter(key => key.includes(destinationName))
      .find(key => this._mappings[key].destinationKey === destinationName);

    const sourceName = this._mappings[sourceKey as string].sourceKey;
    const mapping = this._mappings[AutoMapperBase._getMappingKey(sourceName, destinationName)];

    if (!mapping) {
      throw new Error(
        `Mapping not found for source ${sourceName} and destination ${destinationName}`
      );
    }

    return mapping;
  }

  protected _dispose() {
    Object.keys(this._mappings).forEach(key => {
      delete this._mappings[key];
    });
  }

  private _hasMapping<TSource, TDestination>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): string {
    const key = AutoMapperBase._getMappingKey(source.name, destination.name);
    if (this._mappings[key]) {
      throw new Error(
        `Mapping for source ${source.name} and destination ${destination.name} is already existed`
      );
    }

    return key;
  }

  private static _getMappingKey(sourceKey: string, destinationKey: string): string {
    return sourceKey + '->' + destinationKey;
  }

  private static _isClass<TSource>(fn: Constructable<TSource>): boolean {
    return (
      fn.constructor &&
      (/^\s*function/.test(fn.constructor.toString()) ||
        /^\s*class/.test(fn.constructor.toString())) &&
      fn.constructor.toString().includes(fn.constructor.name)
    );
  }

  private static _isDate<TSource>(fn: Constructable<TSource>): boolean {
    return fn && Object.prototype.toString.call(fn) === '[object Date]' && !isNaN(fn as any);
  }

  private static _isArray<TSource>(fn: Constructable<TSource>): boolean {
    return Array.isArray(fn) && Object.prototype.toString.call(fn) === '[object Array]';
  }

  private static _isResolver<TSource>(fn: MapFromCallback<TSource>): fn is Resolver {
    return 'resolve' in fn;
  }

  private _getMappingForNestedKey<TSource, TDestination>(
    val: Constructable<TSource>
  ): Mapping<TSource, TDestination> {
    const mappingName = val.constructor.name;
    const destinationEntry = Object.entries(this._mappings)
      .filter(([key, _]) => key.includes(mappingName))
      .find(([key, _]) => this._mappings[key].sourceKey === mappingName);

    if (!destinationEntry) {
      throw new Error(`Mapping not found for source ${mappingName}`);
    }

    const destination = destinationEntry[1].destination as Constructable<TDestination>;

    if (!destination) {
      throw new Error(`Mapping not found for source ${mappingName}`);
    }

    const mapping = this._getMapping(val, destination);

    if (!mapping) {
      throw new Error(
        `Mapping not found for source ${mappingName} and destination ${destination.name ||
          destination.constructor.name}`
      );
    }

    return mapping;
  }

  private static _getSourcePropertyKey(
    destinationMemberNamingConvention: NamingConvention,
    sourceMemberNamingConvention: NamingConvention,
    key: string
  ): string {
    const keyParts = key
      .split(destinationMemberNamingConvention.splittingExpression)
      .filter(Boolean);
    return !keyParts.length ? key : sourceMemberNamingConvention.transformPropertyName(keyParts);
  }
}
