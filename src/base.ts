import {
  Constructable,
  CreateMapFluentFunctions,
  DestinationMappingProperty,
  DestinationMemberConfigurationOptions,
  Mapping, MappingProfile, MemberCallback, SourceMappingProperty
} from './types'

export abstract class AutoMapperBase {
  public abstract map<TSource, TDestination>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>,
    sourceObj: TSource
  ): TDestination;

  public abstract createMap<TSource, TDestination>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination>;

  protected getMapping<TSource, TDestination>(
    mappings: { [key: string]: Mapping<TSource, TDestination> },
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): Mapping<TSource, TDestination> {
    const sourceKey = source.name
    const destinationKey = destination.name
    const mapping: Mapping<TSource, TDestination> = mappings[sourceKey + destinationKey]
    if (!mapping) {
      throw new Error(`Could not find map object with a source of ${ sourceKey } and a destination of ${ destinationKey }`)
    }

    return mapping
  }

  protected isArray<TSource>(sourceObject: TSource): boolean {
    return typeof (sourceObject) === 'object' && sourceObject instanceof Array
  }

  protected handleArray<TSource, TDestination>(
    mapping: Mapping<TSource, TDestination>,
    sourceArray: TSource[],
    itemFunc: (sourceObj: TSource, destinationObj: TDestination) => void
  ): TDestination[] {
    const arrayLength = sourceArray.length
    const destinationArray = new Array<TDestination>(arrayLength)

    for (let i = 0; i < arrayLength; i++) {
      const sourceObj = sourceArray[i]
      let destinationObj: TDestination
      if (sourceObj === null || sourceObj === undefined) {
        destinationObj = sourceObj as any
      } else {
        destinationObj = this.createDestinationObject(mapping.destinationTypeClass)
        itemFunc(sourceObj, destinationObj)
      }
      destinationArray[i] = destinationObj
    }
    return destinationArray
  }

  protected handleItem<TSource, TDestination>(
    mapping: Mapping<TSource, TDestination>,
    sourceObj: TSource,
    destinationObj: TDestination,
    propFunc: (propName: string) => void
  ): TSource | TDestination {
    let atLeastOnePropMapped = false

    for (const prop of mapping.properties) {
      atLeastOnePropMapped = true
      propFunc(prop.name)
    }

    for (const sourcePropName in sourceObj) {
      if (!(sourceObj as any).hasOwnProperty(sourcePropName)) {
        continue
      }

      atLeastOnePropMapped = true
      propFunc(sourcePropName)
    }

    if (!atLeastOnePropMapped && (sourceObj === null || sourceObj === undefined)) {
      return sourceObj
    }

    return destinationObj
  }

  protected handleProperty<TSource, TDestination>(
    mapping: Mapping<TSource, TDestination>,
    sourceObj: TSource,
    sourcePropName: keyof TSource,
    destinationObj: TDestination,
    transformFn: (
      destinationProperty: DestinationMappingProperty<TSource, TDestination>,
      memberOptions: DestinationMemberConfigurationOptions<TSource, TDestination>,
      callback?: MemberCallback<TDestination>
    ) => void,
    autoMappingCbFn?: (destinationPropVal: TDestination[keyof TDestination]) => void
  ): void {
    const propertyMappings = this.getPropertyMappings(mapping.properties, sourcePropName)
    if (propertyMappings.length) {
      for (const propMapping of propertyMappings) {
        this.processMappedProperty(mapping, propMapping, sourceObj, sourcePropName, transformFn)
      }
    } else {
      this.handlePropertyWithAutoMapping(mapping, sourceObj, sourcePropName, destinationObj, autoMappingCbFn)
    }
  }

  protected createDestinationObject<TDestination>(destination: Constructable<TDestination>): TDestination {
    return destination ? new destination() : {} as TDestination
  }

  protected setPropertyValue<TSource, TDestination>(
    mapping: Mapping<TSource, TDestination>,
    destinationProperty: DestinationMappingProperty<TSource, TDestination>,
    destinationObj: TDestination,
    destinationPropVal: TDestination[keyof TDestination]
  ): void {
    if (mapping.forAllMembersMappings.length) {
      for (const forAllMembersMapping of mapping.forAllMembersMappings) {
        forAllMembersMapping(destinationObj, destinationProperty.name as keyof TDestination, destinationPropVal)
      }
    } else {
      destinationObj[destinationProperty.name as keyof TDestination] = destinationPropVal
    }
  }

  protected setPropertyValueByName<TSource, TDestination>(
    mapping: Mapping<TSource, TDestination>,
    destinationObj: TDestination,
    destinationPropName: keyof TDestination,
    destinationPropVal: TDestination[keyof TDestination]
  ): void {
    if (mapping.forAllMembersMappings.length) {
      for (const forAllMemberMapping of mapping.forAllMembersMappings) {
        forAllMemberMapping(destinationObj, destinationPropName, destinationPropVal)
      }
    } else {
      destinationObj[destinationPropName] = destinationPropVal
    }
  }

  protected shouldProcessDestination<TSource, TDestination>(
    destination: DestinationMappingProperty<TSource, TDestination>,
    sourceObj: TSource
  ): boolean {
    if (destination.ignore) {
      return false
    }

    if (destination.conditionFn) {
      if (!destination.conditionFn(sourceObj)) {
        return false
      }
    }

    return true
  }

  private handlePropertyWithAutoMapping<TSource, TDestination>(
    mapping: Mapping<TSource, TDestination>,
    sourceObj: TSource,
    sourcePropName: keyof TSource,
    destinationObj: TDestination,
    autoMappingCbFn?: (destinationPropVal: TDestination[keyof TDestination]) => void
  ): void {
    if (mapping.ignoreAllNonExisting) {
      return
    }

    if (mapping.destinationTypeClass && Object.keys(destinationObj).indexOf(sourcePropName as string) < 0) {
      return
    }

    let objectVal: TDestination = null as any
    let isNestedObj = false

    if (typeof (destinationObj as any)[sourcePropName] ===
      'object' &&
      (destinationObj as any)[sourcePropName]) {
      isNestedObj = ((destinationObj as any)[sourcePropName].constructor.name !== 'object')

      if (isNestedObj) {
        this.createMap((sourceObj as any)[sourcePropName].constructor,
          (destinationObj as any)[sourcePropName].constructor)
          .convertToType((destinationObj as any)[sourcePropName].constructor)

        objectVal = this.map((sourceObj as any)[sourcePropName].constructor,
          (destinationObj as any)[sourcePropName].constructor,
          sourceObj[sourcePropName])
      }
    }

    const destinationPropName = this.getDestinationPropertyName(mapping.profile as MappingProfile, sourcePropName)
    const destinationPropVal = this.getDestinationPropertyValue(sourceObj, sourcePropName, objectVal, isNestedObj)
    this.setPropertyValueByName(mapping,
      destinationObj,
      destinationPropName as keyof TDestination,
      destinationPropVal as TDestination[keyof TDestination])
    if (autoMappingCbFn) {
      autoMappingCbFn(destinationPropVal as TDestination[keyof TDestination])
    }
  }

  private getDestinationPropertyName<TSource, TDestination>(
    profile: MappingProfile,
    sourcePropName: keyof TSource
  ): string {
    if (!profile) {
      return sourcePropName as string
    }

    try {
      const sourcePropNameParts = (sourcePropName as string).split(profile.sourceMemberNamingConvention.splittingExpression)
      for (let i = sourcePropNameParts.length - 1; i >= 0; i--) {
        if (sourcePropNameParts[i] === '') {
          sourcePropNameParts.splice(i, 1)
        }
      }

      return profile.destinationMemberNamingConvention.transformPropertyName(sourcePropNameParts)
    } catch (err) {
      return sourcePropName as string
    }
  }

  private getDestinationPropertyValue<TSource, TDestination>(
    sourceObj: TSource,
    sourcePropName: keyof TSource,
    objectVal: TDestination,
    isNestedObject: boolean
  ): TDestination | TDestination[keyof TDestination] | null {
    if (isNestedObject) {
      return objectVal
    }

    return sourceObj ? (sourceObj as any)[sourcePropName] : null
  }

  private getPropertyMappings<TSource, TDestination>(
    properties: Array<SourceMappingProperty<TSource, TDestination>>,
    sourcePropertyName: keyof TSource
  ): Array<SourceMappingProperty<TSource, TDestination>> {
    const result = [] as Array<SourceMappingProperty<TSource, TDestination>>

    for (const prop of properties) {
      if (prop.name === sourcePropertyName) {
        result.push(prop)
      }
    }

    return result
  }

  private processMappedProperty<TSource, TDestination>(
    mapping: Mapping<TSource, TDestination>,
    propertyMapping: SourceMappingProperty<TSource, TDestination>,
    sourceObj: TSource | TSource[keyof TSource],
    sourcePropName: keyof TSource | keyof TSource[keyof TSource],
    transformFn: (
      destinationProperty: DestinationMappingProperty<TSource, TDestination>,
      memberOptions: DestinationMemberConfigurationOptions<TSource, TDestination>
    ) => void
  ): void {
    if (propertyMapping.children && propertyMapping.children.length) {
      const childSourceObj = sourceObj ? (sourceObj as any)[propertyMapping.name] : null
      for (const child of propertyMapping.children) {
        this.processMappedProperty(mapping, child, childSourceObj, child.name as any, transformFn)
        return
      }
    }

    const destination = propertyMapping.destination
    const configOptions = this.createMemberConfigurationOptions<TSource, TDestination>(sourceObj as TSource,
      sourcePropName as keyof TSource)
    transformFn(destination as DestinationMappingProperty<TSource, TDestination>, configOptions)
  }

  private createMemberConfigurationOptions<TSource, TDestination>(
    sourceObj: TSource,
    sourcePropName: keyof TSource
  ): DestinationMemberConfigurationOptions<TSource, TDestination> {
    return {
      ignore: () => {
        // no action required
      },
      condition: predicate => {
        // no action required
      },
      mapFrom: mapFromCb => {
        // no action required
      },
      sourceObject: sourceObj,
      sourcePropertyName: sourcePropName,
      intermediatePropertyValue: sourceObj ? sourceObj[sourcePropName] : sourceObj
    }
  }
}
