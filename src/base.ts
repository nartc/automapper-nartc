import { entries, get, lowerCase } from 'lodash';
import {
  Constructable,
  ForMemberFunction,
  ForPathDestinationFn,
  Mapping,
  MappingProperty,
  TransformationType
} from './types';

export abstract class AutoMapperBase {
  protected readonly _mappings!: { [key: string]: Mapping };

  protected constructor() {
    this._mappings = {};
  }

  protected getTransformationType<
    TSource extends { [key in keyof TSource]: any } = any,
    TDestination extends {} = any
  >(forMemberFn: ForMemberFunction<TSource, TDestination>): TransformationType {
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

    return TransformationType.MapFrom;
  }

  protected _mapArray<
    TSource extends { [key in keyof TSource]: any } = any,
    TDestination extends { [key in keyof TDestination]: any } = any
  >(sourceArray: TSource[], mapping: Mapping<TSource, TDestination>): TDestination[] {
    return sourceArray.map(s => this._map(s, mapping));
  }

  protected _map<
    TSource extends { [key in keyof TSource]: any } = any,
    TDestination extends { [key in keyof TDestination]: any } = any
  >(sourceObj: TSource, mapping: Mapping<TSource, TDestination>): TDestination {
    const { destination, properties } = mapping;
    const destinationObj = new destination();
    const configProps = [...properties.keys()];

    const destinationKeys = Object.keys(destinationObj);
    const destinationKeysLen = destinationKeys.length;

    for (let i = 0; i < destinationKeysLen; i++) {
      const key = destinationKeys[i] as keyof TDestination;
      if (configProps.includes(key)) {
        continue;
      }

      if (!sourceObj.hasOwnProperty(key)) {
        const keys = lowerCase(key as string).split(' ');
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

      const sourceVal: TSource[keyof TSource] = sourceObj[key];
      if (typeof sourceVal === 'object') {
        if (this._isDate(sourceVal)) {
          destinationObj[key] = new Date(sourceVal) as TDestination[keyof TDestination];
          continue;
        }

        if (this._isArray(sourceVal)) {
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
        this._isClass(sourceVal)
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
      if (prop.transformation.transformationType === TransformationType.Ignore) {
        destinationObj[prop.destinationKey] = null as any;
        continue;
      }

      if (prop.transformation.transformationType === TransformationType.Condition) {
        const condition = prop.transformation.condition(sourceObj);
        if (condition) {
          destinationObj[prop.destinationKey] = (sourceObj as any)[prop.destinationKey];
        }
        continue;
      }

      destinationObj[prop.destinationKey] = prop.transformation.mapFrom(sourceObj);
    }

    this._assertMappingErrors(destinationObj, propKeys);

    return destinationObj;
  }

  private _assertMappingErrors<T extends { [key in keyof T]: any } = any>(
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

    const mapping = {
      source,
      destination,
      sourceKey: source.name,
      destinationKey: destination.name,
      properties: new Map()
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
      properties: new Map()
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

    this._mappings[key] = reverseMapping;

    return reverseMapping;
  }

  protected _getKeyFromMemberFn<T extends { [key in keyof T]: any } = any>(
    fn: ForPathDestinationFn<T>
  ): keyof T {
    return fn.toString().includes('function')
      ? ((fn
          .toString()
          .split('return')
          .pop() as string)
          .replace(/}|;/gm, '')
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
    const sourceName = source.name || source.constructor.name;
    const destinationName = destination.name || destination.constructor.name;
    const mapping = this._mappings[this._getMappingKey(sourceName, destinationName)];

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
    const destinationName = destination.name || destination.constructor.name;
    const sourceKey = Object.keys(this._mappings)
      .filter(key => key.includes(destinationName))
      .find(key => this._mappings[key].destinationKey === destinationName);

    const sourceName = this._mappings[sourceKey as string].sourceKey;
    const mapping = this._mappings[this._getMappingKey(sourceName, destinationName)];

    if (!mapping) {
      throw new Error(
        `Mapping not found for source ${sourceName} and destination ${destinationName}`
      );
    }

    return mapping;
  }

  private _hasMapping<TSource, TDestination>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): string {
    const key = this._getMappingKey(source.name, destination.name);
    if (this._mappings[key]) {
      throw new Error(
        `Mapping for source ${source.name} and destination ${destination.name} is already existed`
      );
    }

    return key;
  }

  private _getMappingKey(sourceKey: string, destinationKey: string): string {
    return sourceKey + '->' + destinationKey;
  }

  private _isClass<TSource>(fn: Constructable<TSource>): boolean {
    return (
      fn.constructor &&
      (/^\s*function/.test(fn.constructor.toString()) ||
        /^\s*class/.test(fn.constructor.toString())) &&
      fn.constructor.toString().includes(fn.constructor.name)
    );
  }

  private _isDate<TSource>(fn: Constructable<TSource>): boolean {
    return fn && Object.prototype.toString.call(fn) === '[object Date]' && !isNaN(fn as any);
  }

  private _isArray<TSource>(fn: Constructable<TSource>): boolean {
    return Array.isArray(fn) && Object.prototype.toString.call(fn) === '[object Array]';
  }

  private _getMappingForNestedKey<TSource, TDestination>(
    val: Constructable<TSource>
  ): Mapping<TSource, TDestination> {
    const mappingName = val.name || val.constructor.name;
    const destinationEntry = entries(this._mappings)
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
}

// import {
//   Constructable,
//   CreateMapFluentFunctions,
//   DestinationMappingProperty,
//   DestinationMemberConfigurationOptions,
//   Mapping,
//   MappingProfile,
//   MemberCallback,
//   SourceMappingProperty
// } from './types'
//
// export abstract class AutoMapperBase {
//   public abstract map<TSource, TDestination>(
//     source: Constructable<TSource>,
//     destination: Constructable<TDestination>,
//     sourceObj: TSource
//   ): TDestination
//
//   public abstract createMap<TSource, TDestination>(
//     source: Constructable<TSource>,
//     destination: Constructable<TDestination>
//   ): CreateMapFluentFunctions<TSource, TDestination>
//
//   protected getMapping<TSource, TDestination>(
//     mappings: { [key: string]: Mapping<TSource, TDestination> },
//     source: Constructable<TSource>,
//     destination: Constructable<TDestination>
//   ): Mapping<TSource, TDestination> {
//     const sourceKey = source.name
//     const destinationKey = destination.name
//     const mapping: Mapping<TSource, TDestination> = mappings[sourceKey + '_' + destinationKey]
//     if (!mapping) {
//       throw new Error(
//         `Could not find map object with a source of ${sourceKey} and a destination of ${destinationKey}`
//       )
//     }
//
//     return mapping
//   }
//
//   protected isArray<TSource>(sourceObject: TSource): boolean {
//     return typeof sourceObject === 'object' && sourceObject instanceof Array
//   }
//
//   protected handleArray<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     sourceArray: TSource[],
//     itemFunc: (sourceObj: TSource, destinationObj: TDestination) => void
//   ): TDestination[] {
//     const arrayLength = sourceArray.length
//     const destinationArray = new Array<TDestination>(arrayLength)
//
//     for (let i = 0; i < arrayLength; i++) {
//       const sourceObj = sourceArray[i]
//       let destinationObj: TDestination
//       if (sourceObj === null || sourceObj === undefined) {
//         destinationObj = sourceObj as any
//       } else {
//         destinationObj = this.createDestinationObject(mapping.destinationTypeClass)
//         itemFunc(sourceObj, destinationObj)
//       }
//       destinationArray[i] = destinationObj
//     }
//     return destinationArray
//   }
//
//   protected handleItem<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     sourceObj: TSource,
//     destinationObj: TDestination,
//     propFunc: (propName: string) => void
//   ): TSource | TDestination {
//     let atLeastOnePropMapped = false
//
//     for (const prop of mapping.properties) {
//       atLeastOnePropMapped = true
//       propFunc(prop.name)
//     }
//
//     for (const sourcePropName in sourceObj) {
//       if (!(sourceObj as any).hasOwnProperty(sourcePropName)) {
//         continue
//       }
//
//       atLeastOnePropMapped = true
//       propFunc(sourcePropName)
//     }
//
//     if (!atLeastOnePropMapped && (sourceObj === null || sourceObj === undefined)) {
//       return sourceObj
//     }
//
//     return destinationObj
//   }
//
//   protected handleProperty<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     sourceObj: TSource,
//     sourcePropName: keyof TSource,
//     destinationObj: TDestination,
//     transformFn: (
//       destinationProperty: DestinationMappingProperty<TSource, TDestination>,
//       memberOptions: DestinationMemberConfigurationOptions<TSource, TDestination>,
//       callback?: MemberCallback<TDestination>
//     ) => void,
//     autoMappingCbFn?: (destinationPropVal: TDestination[keyof TDestination]) => void
//   ): void {
//     const propertyMappings = this.getPropertyMappings(mapping.properties, sourcePropName)
//     if (propertyMappings.length) {
//       for (const propMapping of propertyMappings) {
//         this.processMappedProperty(mapping, propMapping, sourceObj, sourcePropName, transformFn)
//       }
//     } else {
//       this.handlePropertyWithAutoMapping(
//         mapping,
//         sourceObj,
//         sourcePropName,
//         destinationObj,
//         autoMappingCbFn
//       )
//     }
//   }
//
//   protected createDestinationObject<TDestination>(
//     destination: Constructable<TDestination>
//   ): TDestination {
//     return destination ? new destination() : ({} as TDestination)
//   }
//
//   protected setPropertyValue<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     destinationProperty: DestinationMappingProperty<TSource, TDestination>,
//     destinationObj: TDestination,
//     destinationPropVal: TDestination[keyof TDestination]
//   ): void {
//     if (mapping.forAllMembersMappings.length) {
//       for (const forAllMembersMapping of mapping.forAllMembersMappings) {
//         forAllMembersMapping(
//           destinationObj,
//           destinationProperty.name as keyof TDestination,
//           destinationPropVal
//         )
//       }
//     } else {
//       destinationObj[destinationProperty.name as keyof TDestination] = destinationPropVal
//     }
//   }
//
//   protected setPropertyValueByName<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     destinationObj: TDestination,
//     destinationPropName: keyof TDestination,
//     destinationPropVal: TDestination[keyof TDestination]
//   ): void {
//     if (mapping.forAllMembersMappings.length) {
//       for (const forAllMemberMapping of mapping.forAllMembersMappings) {
//         forAllMemberMapping(destinationObj, destinationPropName, destinationPropVal)
//       }
//     } else {
//       destinationObj[destinationPropName] = destinationPropVal
//     }
//   }
//
//   protected shouldProcessDestination<TSource, TDestination>(
//     destination: DestinationMappingProperty<TSource, TDestination>,
//     sourceObj: TSource
//   ): boolean {
//     if (destination.ignore) {
//       return false
//     }
//
//     if (destination.conditionFn) {
//       if (!destination.conditionFn(sourceObj)) {
//         return false
//       }
//     }
//
//     return true
//   }
//
//   private handlePropertyWithAutoMapping<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     sourceObj: TSource,
//     sourcePropName: keyof TSource,
//     destinationObj: TDestination,
//     autoMappingCbFn?: (destinationPropVal: TDestination[keyof TDestination]) => void
//   ): void {
//     if (mapping.ignoreAllNonExisting) {
//       return
//     }
//
//     if (
//       mapping.destinationTypeClass &&
//       Object.keys(destinationObj).indexOf(sourcePropName as string) < 0
//     ) {
//       return
//     }
//
//     let objectVal: TDestination = null as any
//     let isNestedObj = false
//
//     if (
//       typeof (destinationObj as any)[sourcePropName] === 'object' &&
//       (destinationObj as any)[sourcePropName]
//     ) {
//       isNestedObj = (destinationObj as any)[sourcePropName].constructor.name !== 'object'
//
//       if (isNestedObj) {
//         this.createMap(
//           (sourceObj as any)[sourcePropName].constructor,
//           (destinationObj as any)[sourcePropName].constructor
//         ).convertToType((destinationObj as any)[sourcePropName].constructor)
//
//         objectVal = this.map(
//           (sourceObj as any)[sourcePropName].constructor,
//           (destinationObj as any)[sourcePropName].constructor,
//           sourceObj[sourcePropName]
//         )
//       }
//     }
//
//     const destinationPropName = this.getDestinationPropertyName(
//       mapping.profile as MappingProfile,
//       sourcePropName
//     )
//     const destinationPropVal = this.getDestinationPropertyValue(
//       sourceObj,
//       sourcePropName,
//       objectVal,
//       isNestedObj
//     )
//     this.setPropertyValueByName(
//       mapping,
//       destinationObj,
//       destinationPropName as keyof TDestination,
//       destinationPropVal as TDestination[keyof TDestination]
//     )
//     if (autoMappingCbFn) {
//       autoMappingCbFn(destinationPropVal as TDestination[keyof TDestination])
//     }
//   }
//
//   private getDestinationPropertyName<TSource, TDestination>(
//     profile: MappingProfile,
//     sourcePropName: keyof TSource
//   ): string {
//     if (!profile) {
//       return sourcePropName as string
//     }
//
//     try {
//       const sourcePropNameParts = (sourcePropName as string).split(
//         profile.sourceMemberNamingConvention.splittingExpression
//       )
//       for (let i = sourcePropNameParts.length - 1; i >= 0; i--) {
//         if (sourcePropNameParts[i] === '') {
//           sourcePropNameParts.splice(i, 1)
//         }
//       }
//
//       return profile.destinationMemberNamingConvention.transformPropertyName(sourcePropNameParts)
//     } catch (err) {
//       return sourcePropName as string
//     }
//   }
//
//   private getDestinationPropertyValue<TSource, TDestination>(
//     sourceObj: TSource,
//     sourcePropName: keyof TSource,
//     objectVal: TDestination,
//     isNestedObject: boolean
//   ): TDestination | TDestination[keyof TDestination] | null {
//     if (isNestedObject) {
//       return objectVal
//     }
//
//     return sourceObj ? (sourceObj as any)[sourcePropName] : null
//   }
//
//   private getPropertyMappings<TSource, TDestination>(
//     properties: Array<SourceMappingProperty<TSource, TDestination>>,
//     sourcePropertyName: keyof TSource
//   ): Array<SourceMappingProperty<TSource, TDestination>> {
//     const result = [] as Array<SourceMappingProperty<TSource, TDestination>>
//
//     for (const prop of properties) {
//       if (prop.name === sourcePropertyName) {
//         result.push(prop)
//       }
//     }
//
//     return result
//   }
//
//   private processMappedProperty<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     propertyMapping: SourceMappingProperty<TSource, TDestination>,
//     sourceObj: TSource | TSource[keyof TSource],
//     sourcePropName: keyof TSource | keyof TSource[keyof TSource],
//     transformFn: (
//       destinationProperty: DestinationMappingProperty<TSource, TDestination>,
//       memberOptions: DestinationMemberConfigurationOptions<TSource, TDestination>
//     ) => void
//   ): void {
//     if (propertyMapping.children && propertyMapping.children.length) {
//       const childSourceObj = sourceObj ? (sourceObj as any)[propertyMapping.name] : null
//       for (const child of propertyMapping.children) {
//         this.processMappedProperty(mapping, child, childSourceObj, child.name as any, transformFn)
//         return
//       }
//     }
//
//     const destination = propertyMapping.destination
//     const configOptions = this.createMemberConfigurationOptions<TSource, TDestination>(
//       sourceObj as TSource,
//       sourcePropName as keyof TSource
//     )
//     transformFn(destination as DestinationMappingProperty<TSource, TDestination>, configOptions)
//   }
//
//   private createMemberConfigurationOptions<TSource, TDestination>(
//     sourceObj: TSource,
//     sourcePropName: keyof TSource
//   ): DestinationMemberConfigurationOptions<TSource, TDestination> {
//     return {
//       ignore: () => {
//         // no action required
//       },
//       condition: predicate => {
//         // no action required
//       },
//       mapFrom: mapFromCb => {
//         // no action required
//       },
//       sourceObject: sourceObj,
//       sourcePropertyName: sourcePropName,
//       intermediatePropertyValue: sourceObj ? sourceObj[sourcePropName] : sourceObj
//     }
//   }
// }
