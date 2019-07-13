// // Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import { AutoMapperBase } from './base'
// // import "core-js/fn/array.find"
// // ...
// import {
//   findProperty,
//   getDestinationProperty,
//   getMappingMetadata,
//   handleCurrying,
//   handleMapFromProperties,
//   matchSourcePropertyByDestination
// } from './helpers'
// import {
//   Configuration,
//   Constructable,
//   CreateMapFluentFunctions,
//   DestinationMappingProperty,
//   DestinationMappingTransformation,
//   DestinationMemberConfigurationOptions,
//   DestinationTransformationType,
//   ForAllMembersFn,
//   ForMemberFn,
//   ForMemberValueOrFunction,
//   ForSourceMemberFn,
//   Mapping,
//   MappingProfile,
//   MappingProperty,
//   MemberMappingMetadata,
//   SourceMappingProperty
// } from './types'
//
// export class AutoMapper extends AutoMapperBase {
//   private static _instance: AutoMapper = new AutoMapper()
//
//   private readonly _mappings!: {
//     [name: string]: any
//   }
//   private readonly _profiles!: {
//     [profile: string]: MappingProfile
//   }
//
//   public static getInstance(): AutoMapper {
//     return this._instance
//   }
//
//   constructor() {
//     super()
//     if (AutoMapper._instance) {
//       return AutoMapper._instance
//     }
//
//     AutoMapper._instance = this
//     this._profiles = {}
//     this._mappings = {}
//   }
//
//   public initialize(configFn: (config: Configuration) => void): void {
//     const configuration: Configuration = {
//       addProfile: profile => {
//         profile.configure()
//         this._profiles[profile.profileName] = profile
//       },
//       createMap: <TSource, TDestination>(
//         source: Constructable<TSource>,
//         destination: Constructable<TDestination>
//       ) => {
//         return this.createMap<TSource, TDestination>(source, destination)
//       }
//     }
//
//     configFn(configuration)
//   }
//
//   public createMap<TSource, TDestination>(
//     source: Constructable<TSource>,
//     destination: Constructable<TDestination>
//   ): CreateMapFluentFunctions<TSource, TDestination> {
//     if (arguments.length < 2) {
//       return handleCurrying(this.createMap, arguments, this)
//     }
//
//     const mapping = this.createMappingObjectForArgs(source, destination)
//     return this.createMapGetFluentApiFunctions<TSource, TDestination>(mapping)
//   }
//
//   public map<TSource, TDestination>(
//     source: Constructable<TSource>,
//     destination: Constructable<TDestination>,
//     sourceObj: TSource
//   ): any {
//     if (arguments.length === 3) {
//       return this.mapInternal(
//         super.getMapping(this._mappings, source, destination),
//         sourceObj
//       ) as TDestination
//     }
//
//     if (arguments.length === 2) {
//       return (sourceObj: TSource): TDestination =>
//         this.mapInternal(
//           super.getMapping(this._mappings, source, destination),
//           sourceObj
//         ) as TDestination
//     }
//
//     if (arguments.length === 1) {
//       return (dest: Constructable<TDestination>, sourceObj: TSource): TDestination =>
//         this.map(source, destination, sourceObj) as TDestination
//     }
//
//     return (
//       src: Constructable<TSource>,
//       dest: Constructable<TDestination>,
//       sourceObj: TSource
//     ): TDestination => this.map(src, dest, sourceObj) as TDestination
//   }
//
//   private mapInternal<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     sourceObj: TSource | TSource[] | null
//   ): TDestination | TDestination[] | null {
//     if (sourceObj === null || typeof sourceObj === 'undefined') {
//       return null
//     }
//
//     if (mapping.async) {
//       throw new Error(
//         'Impossible to use asynchronous mapping using automapper.map(); use automapper.mapAsync() instead.'
//       )
//     }
//
//     if (super.isArray(sourceObj)) {
//       const mapped = this.mapArray(mapping, sourceObj as TSource[])
//       return mapped.map(m => {
//         const dest = new mapping.destinationTypeClass()
//         for (const k in m) {
//           dest[k] = m[k]
//         }
//
//         return dest
//       })
//     }
//
//     const mapped = mapping.mapItemFn(
//       mapping,
//       sourceObj as TSource,
//       super.createDestinationObject(mapping.destinationTypeClass)
//     )
//     const result = new mapping.destinationTypeClass()
//     for (const key in mapped) {
//       result[key] = mapped[key]
//     }
//
//     return result
//   }
//
//   private mapArray<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     sourceObj: TSource[]
//   ): TDestination[] {
//     return super.handleArray(mapping, sourceObj, (sourceObj1, destinationObj) => {
//       mapping.mapItemFn(mapping, sourceObj1, destinationObj)
//     })
//   }
//
//   private mapItem<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     sourceObj: TSource,
//     destinationObj: TDestination
//   ): TDestination {
//     destinationObj = super.handleItem(mapping, sourceObj, destinationObj, propName => {
//       this.mapProperty(mapping, sourceObj, destinationObj, propName)
//     }) as TDestination
//     return destinationObj
//   }
//
//   private mapProperty<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     sourceObject: TSource,
//     destinationObject: TDestination,
//     propName: string
//   ): void {
//     super.handleProperty(
//       mapping,
//       sourceObject,
//       propName as keyof TSource,
//       destinationObject,
//       (destinationProperty, memberOptions) => {
//         this.transform(mapping, sourceObject, destinationProperty, destinationObject, memberOptions)
//       }
//     )
//   }
//
//   private transform<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     sourceObj: TSource,
//     destinationProperty: DestinationMappingProperty<TSource, TDestination>,
//     destinationObj: TDestination | TDestination[keyof TDestination],
//     options: DestinationMemberConfigurationOptions<TSource, TDestination>
//   ): boolean {
//     const childDestinationProperty = destinationProperty.child
//     if (childDestinationProperty) {
//       let childDestinationObj = (destinationObj as TDestination)[
//         destinationProperty.name as keyof TDestination
//       ]
//       if (!childDestinationObj) {
//         childDestinationObj = {} as any
//       }
//
//       const transformed = this.transform(
//         mapping,
//         sourceObj,
//         childDestinationProperty,
//         childDestinationObj,
//         options
//       )
//       if (transformed) {
//         ;(destinationObj as TDestination)[
//           destinationProperty.name as keyof TDestination
//         ] = childDestinationObj
//       }
//
//       return transformed
//     }
//
//     if (!super.shouldProcessDestination(destinationProperty, sourceObj)) {
//       return false
//     }
//
//     for (const tf of destinationProperty.transformations) {
//       if (!this.processTransformation(destinationProperty, tf, options)) {
//         return false
//       }
//     }
//
//     super.setPropertyValue(
//       mapping,
//       destinationProperty,
//       destinationObj as TDestination,
//       options.intermediatePropertyValue
//     )
//     return true
//   }
//
//   private processTransformation<TSource, TDestination>(
//     property: DestinationMappingProperty<TSource, TDestination>,
//     transformation: DestinationMappingTransformation<TSource, TDestination>,
//     options: DestinationMemberConfigurationOptions<TSource, TDestination>
//   ): boolean {
//     switch (transformation.transformationType) {
//       case DestinationTransformationType.Constant:
//         options.intermediatePropertyValue = transformation.constant
//         return true
//       case DestinationTransformationType.MemberOptions: {
//         const result =
//           transformation.memberConfigurationOptionsFn &&
//           transformation.memberConfigurationOptionsFn(options)
//         if (typeof result !== 'undefined') {
//           options.intermediatePropertyValue = result
//         } else if (!options.sourceObject) {
//           return false
//         }
//
//         return true
//       }
//       case DestinationTransformationType.SourceMemberOptions: {
//         const result =
//           transformation.sourceMemberConfigurationOptionsFn &&
//           transformation.sourceMemberConfigurationOptionsFn(options)
//         if (typeof result !== 'undefined') {
//           options.intermediatePropertyValue = result
//         } else if (!options.sourceObject) {
//           return false
//         }
//         return true
//       }
//       case DestinationTransformationType.AsyncMemberOptions:
//       case DestinationTransformationType.AsyncSourceMemberOptions:
//         return false
//     }
//   }
//
//   private createMappingObjectForArgs<TSource, TDestination>(
//     source: Constructable<TSource>,
//     destination: Constructable<TDestination>
//   ): Mapping<TSource, TDestination> {
//     const mapping: Mapping<TSource, TDestination> = {
//       sourceKey: source.name,
//       destinationKey: destination.name,
//       forAllMembersMappings: [],
//       properties: [],
//       typeConverterFn: undefined,
//       mapItemFn: (mapping, s, d) => this.mapItem(mapping, s, d),
//       sourceTypeClass: source,
//       destinationTypeClass: destination,
//       profile: undefined,
//       async: false,
//       ignoreAllNonExisting: false
//     }
//     this._mappings[mapping.sourceKey + '_' + mapping.destinationKey] = mapping
//     return mapping
//   }
//
//   private createMapGetFluentApiFunctions<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>
//   ): CreateMapFluentFunctions<TSource, TDestination> {
//     const fluentFunctions: CreateMapFluentFunctions<TSource, TDestination> = {
//       forMember: (forMemberFn, valueOrFunction) => {
//         return this.createMapForMember<TSource, TDestination>({
//           mapping,
//           sourceFn: forMemberFn,
//           transformation: valueOrFunction,
//           sourceMapping: false,
//           fluentFunctions
//         })
//       },
//       forSourceMember: (forSourceMemberFn, configFunction) => {
//         return this.createMapForMember<TSource, TDestination>({
//           mapping,
//           sourceFn: forSourceMemberFn,
//           transformation: configFunction,
//           sourceMapping: true,
//           fluentFunctions
//         })
//       },
//       forAllMembers: fn => this.createMapForAllMembers(mapping, fluentFunctions, fn),
//       ignoreAllNonExisting: () => this.createMapIgnoreAllNonExisting(mapping, fluentFunctions),
//       convertToType: typeClass => this.createMapConvertToType(mapping, fluentFunctions, typeClass),
//       /**
//        * TODO: To be implemented
//        */
//       convertUsing: () => {
//         return
//       },
//       withProfile: profile => this.createMapWithProfile(mapping, profile)
//     }
//
//     return fluentFunctions
//   }
//
//   private createMapForMember<TSource, TDestination>(param: {
//     mapping: Mapping<TSource, TDestination>
//     sourceFn: ForMemberFn<TDestination> | ForMemberFn<TSource>
//     transformation: ForMemberValueOrFunction<TSource, TDestination> | ForSourceMemberFn<TSource>
//     sourceMapping: boolean
//     fluentFunctions: CreateMapFluentFunctions<TSource, TDestination>
//   }) {
//     const { mapping, sourceFn, transformation, sourceMapping, fluentFunctions } = param
//     const metadata = getMappingMetadata(sourceFn, transformation, sourceMapping)
//     const property = this.createSourceProperty(metadata)
//
//     if (!this.mergeSourceProperty(property, mapping.properties, sourceMapping)) {
//       mapping.properties.push(property)
//     }
//
//     if (metadata.async) {
//       // TODO: AsyncMapper
//     }
//
//     return fluentFunctions
//   }
//
//   private createMapForAllMembers<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     fluentFunctions: CreateMapFluentFunctions<TSource, TDestination>,
//     fn: ForAllMembersFn<TDestination>
//   ): CreateMapFluentFunctions<TSource, TDestination> {
//     mapping.forAllMembersMappings.push(fn)
//     return fluentFunctions
//   }
//
//   private createMapIgnoreAllNonExisting<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     fluentFunctions: CreateMapFluentFunctions<TSource, TDestination>
//   ): CreateMapFluentFunctions<TSource, TDestination> {
//     mapping.ignoreAllNonExisting = true
//     return fluentFunctions
//   }
//
//   private createMapConvertToType<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     fluentFunctions: CreateMapFluentFunctions<TSource, TDestination>,
//     typeClass: Constructable<TDestination>
//   ): CreateMapFluentFunctions<TSource, TDestination> {
//     if (mapping.destinationTypeClass) {
//       throw new Error('Destination type class can only be set once')
//     }
//
//     mapping.destinationTypeClass = typeClass
//     return fluentFunctions
//   }
//
//   private createMapWithProfile<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     profile: MappingProfile
//   ): void {
//     const _profile = this._profiles[profile.profileName]
//     if (typeof _profile === 'undefined' || _profile.profileName !== profile.profileName) {
//       throw new Error(`Could not find profile with name: ${profile.profileName}`)
//     }
//
//     mapping.profile = _profile
//     this.createMapWithProfileMergeMappings(mapping, _profile)
//   }
//
//   private createMapWithProfileMergeMappings<TSource, TDestination>(
//     mapping: Mapping<TSource, TDestination>,
//     profile: MappingProfile
//   ): void {
//     const profileMappingKey = `${profile.profileName}=>${mapping.sourceKey}=>${mapping.destinationKey}`
//     const profileMapping = this._mappings[profileMappingKey] as Mapping<TSource, TDestination>
//
//     if (!profileMapping) {
//       return
//     }
//
//     if (profileMapping.forAllMembersMappings.length > 0) {
//       mapping.forAllMembersMappings.push(...profileMapping.forAllMembersMappings)
//     }
//
//     if (profileMapping.typeConverterFn) {
//       mapping.typeConverterFn = profileMapping.typeConverterFn
//       mapping.mapItemFn = profileMapping.mapItemFn
//     }
//
//     if (profileMapping.destinationTypeClass) {
//       mapping.destinationTypeClass = profileMapping.destinationTypeClass
//     }
//
//     for (const prop of profileMapping.properties) {
//       const sourceMapping = (getDestinationProperty(
//         prop.destinationPropertyName,
//         prop
//       ) as DestinationMappingProperty<TSource, TDestination>).sourceMapping
//       if (!this.mergeSourceProperty(prop, mapping.properties, sourceMapping)) {
//         mapping.properties.push(prop)
//       }
//     }
//   }
//
//   private createSourceProperty<TSource, TDestination>(
//     metadata: MemberMappingMetadata<TSource, TDestination>,
//     parent?: SourceMappingProperty<TSource, TDestination>
//   ): SourceMappingProperty<TSource, TDestination> {
//     const level = !parent ? 0 : parent.level + 1
//     const sourceNameParts = (metadata.source as string).split('.')
//     const source: SourceMappingProperty<TSource, TDestination> = {
//       name: sourceNameParts[level],
//       sourcePropertyName: metadata.source,
//       destinationPropertyName: metadata.destination,
//       level,
//       children: [],
//       destination: undefined
//     }
//
//     if (level + 1 < sourceNameParts.length) {
//       const child = this.createSourceProperty(metadata, source)
//       if (child) {
//         source.children.push(child)
//       }
//       source.destination = undefined
//     } else {
//       source.destination = this.createDestinationProperty(metadata)
//     }
//
//     return source
//   }
//
//   private createDestinationProperty<TSource, TDestination>(
//     metadata: MemberMappingMetadata<TSource, TDestination>,
//     parent?: DestinationMappingProperty<TSource, TDestination>
//   ): DestinationMappingProperty<TSource, TDestination> {
//     const level = !parent ? 0 : parent.level + 1
//     const destinationNameParts = [metadata.destination]
//     const destination: DestinationMappingProperty<TSource, TDestination> = {
//       name: destinationNameParts[level] as string,
//       sourcePropertyName: metadata.source,
//       destinationPropertyName: metadata.destination,
//       level,
//       child: undefined,
//       transformations: [],
//       conditionFn: undefined,
//       ignore: false,
//       sourceMapping: false
//     }
//
//     if (level + 1 < destinationNameParts.length) {
//       destination.child = this.createDestinationProperty(metadata, destination)
//     } else {
//       destination.sourceMapping = metadata.sourceMapping
//       destination.conditionFn = metadata.condition
//       destination.ignore = metadata.ignore
//       destination.transformations.push(metadata.transformation)
//     }
//
//     return destination
//   }
//
//   private mergeSourceProperty<TSource, TDestination>(
//     property: SourceMappingProperty<TSource, TDestination>,
//     existingProperties: Array<SourceMappingProperty<TSource, TDestination>>,
//     sourceMapping: boolean
//   ): boolean {
//     const existing = sourceMapping
//       ? findProperty(property.name, existingProperties)
//       : matchSourcePropertyByDestination(property, existingProperties)
//
//     if (!existing) {
//       return false
//     }
//
//     if (property.destination) {
//       if ((existing as SourceMappingProperty<TSource, TDestination>).children.length > 0) {
//         const existingDestination = getDestinationProperty(
//           existing.destinationPropertyName,
//           existing as SourceMappingProperty<TSource, TDestination>
//         )
//
//         if (handleMapFromProperties(property as MappingProperty<TSource, TDestination>, existing)) {
//           if (
//             !this.mergeDestinationProperty(
//               property.destination,
//               existingDestination as DestinationMappingProperty<TSource, TDestination>
//             )
//           ) {
//             return false
//           }
//           ;(existing as SourceMappingProperty<
//             TSource,
//             TDestination
//           >).destination = existingDestination as DestinationMappingProperty<TSource, TDestination>
//           ;(existing as SourceMappingProperty<TSource, TDestination>).children = []
//           return true
//         }
//
//         return this.mergeDestinationProperty(
//           property.destination,
//           existingDestination as DestinationMappingProperty<TSource, TDestination>
//         )
//       }
//
//       if (
//         !this.mergeDestinationProperty(property.destination, (existing as SourceMappingProperty<
//           TSource,
//           TDestination
//         >).destination as DestinationMappingProperty<TSource, TDestination>)
//       ) {
//         return false
//       }
//
//       handleMapFromProperties(property, existing)
//       return true
//     }
//
//     if ((existing as SourceMappingProperty<TSource, TDestination>).children.length > 0) {
//       for (const child of property.children) {
//         if (
//           !this.mergeSourceProperty(
//             child,
//             (existing as SourceMappingProperty<TSource, TDestination>).children,
//             sourceMapping
//           )
//         ) {
//           return false
//         }
//       }
//
//       if (
//         (property.destinationPropertyName as string) !== (property.sourcePropertyName as string)
//       ) {
//         existing.name = property.name
//         existing.sourcePropertyName = property.sourcePropertyName
//       }
//       return true
//     }
//
//     const newDestination: DestinationMappingProperty<
//       TSource,
//       TDestination
//     > = getDestinationProperty(
//       existing.destinationPropertyName,
//       property
//     ) as DestinationMappingProperty<TSource, TDestination>
//     if ((property.destinationPropertyName as string) !== (property.sourcePropertyName as string)) {
//       if (
//         !this.mergeDestinationProperty(
//           (existing as SourceMappingProperty<TSource, TDestination>)
//             .destination as DestinationMappingProperty<TSource, TDestination>,
//           newDestination,
//           true
//         )
//       ) {
//         return false
//       }
//
//       ;(existing as SourceMappingProperty<TSource, TDestination>).children = property.children
//       ;(existing as SourceMappingProperty<TSource, TDestination>).destination = undefined
//       existing.name = property.name
//       existing.sourcePropertyName = property.sourcePropertyName
//       return true
//     }
//     return this.mergeDestinationProperty(newDestination, (existing as SourceMappingProperty<
//       TSource,
//       TDestination
//     >).destination as DestinationMappingProperty<TSource, TDestination>)
//   }
//
//   private mergeDestinationProperty<TSource, TDestination>(
//     destination: DestinationMappingProperty<TSource, TDestination>,
//     existingDestination: DestinationMappingProperty<TSource, TDestination>,
//     swapTransformations: boolean = false
//   ): boolean {
//     if (destination.child) {
//       if (existingDestination.child) {
//         if (
//           !this.mergeDestinationProperty(
//             destination.child,
//             existingDestination.child,
//             swapTransformations
//           )
//         ) {
//           return false
//         }
//
//         handleMapFromProperties(destination, existingDestination)
//         return true
//       }
//
//       return false
//     }
//
//     if (
//       existingDestination.sourceMapping !== destination.sourceMapping &&
//       existingDestination.sourcePropertyName !== destination.sourcePropertyName
//     ) {
//       return false
//     }
//
//     if (destination.sourceMapping) {
//       existingDestination.sourceMapping = destination.sourceMapping
//     }
//
//     if (destination.ignore) {
//       existingDestination.ignore = destination.ignore
//     }
//
//     if (destination.conditionFn) {
//       existingDestination.conditionFn = destination.conditionFn
//     }
//
//     const transformations: DestinationMappingTransformation<TSource, TDestination>[] = []
//     if (swapTransformations) {
//       for (const tf of destination.transformations) {
//         transformations.push(tf)
//       }
//       for (const tf of existingDestination.transformations) {
//         transformations.push(tf)
//       }
//     } else {
//       for (const tf of existingDestination.transformations) {
//         transformations.push(tf)
//       }
//       for (const tf of destination.transformations) {
//         transformations.push(tf)
//       }
//     }
//
//     existingDestination.transformations = transformations
//     handleMapFromProperties(destination, existingDestination)
//     return true
//   }
// }
//
// export const Mapper = new AutoMapper()

// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
import { AutoMapperBase } from './base'
// import "core-js/fn/array.find"
// ...
import {
  Configuration,
  Constructable,
  CreateMapFluentFunctions,
  ForMemberFunction,
  Mapping,
  MappingProperty
} from './types'

export class AutoMapper extends AutoMapperBase {
  private static _instance: AutoMapper = new AutoMapper()

  private readonly _mappings!: { [key: string]: Mapping }
  private readonly _profiles!: { [key: string]: any }

  public static getInstance(): AutoMapper {
    return this._instance
  }

  constructor() {
    super()
    if (AutoMapper._instance) {
      return AutoMapper._instance
    }

    AutoMapper._instance = this
    this._mappings = {}
    this._profiles = {}
  }

  public initialize(configFn: (config: Configuration) => void): void {
    const configuration: Configuration = {
      addProfile: (profile: any): void => {
        // profile.configure();
        this._profiles[profile.profileName] = profile
      },
      createMap: <TSource extends {} = any, TDestination extends {} = any>(
        source: Constructable<TSource>,
        destination: Constructable<TDestination>
      ): CreateMapFluentFunctions<TSource, TDestination> => {
        return this._createMap(source, destination)
      }
    }

    configFn(configuration)
  }

  public map<TSource extends {} = any, TDestination extends {} = any>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>,
    sourceObj: TSource
  ): TDestination {
    const mapping = this._mappings[super.getMappingKey(source.name, destination.name)]
    if (!mapping) {
      throw new Error(
        `Mapping not found for source ${source.name} and destination ${destination.name}`
      )
    }

    return super._map(sourceObj, mapping)
  }

  private _createMap<TSource extends {} = any, TDestination extends {} = any>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination> {
    const key = super.getMappingKey(source.name, destination.name)
    if (this._mappings[key]) {
      throw new Error(
        `Mapping for source ${source.name} to destination ${destination.name} is already existed`
      )
    }

    const mapping = this._createMappingObject(source, destination, key)
    return this._createMappingFluentFunctions<TSource, TDestination>(mapping)
  }

  private _createMappingObject<TSource extends {} = any, TDestination extends {} = any>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>,
    mappingKey: string
  ): Mapping<TSource, TDestination> {
    const mapping = {
      source,
      destination,
      sourceKey: source.name,
      destinationKey: destination.name,
      properties: []
    }

    this._mappings[mappingKey] = mapping
    return mapping
  }

  private _createMappingFluentFunctions<TSource extends {} = any, TDestination extends {} = any>(
    mapping: Mapping<TSource, TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination> {
    const fluentFunctions: CreateMapFluentFunctions<TSource, TDestination> = {
      forMember: (destinationKey, forMemberFn) => {
        return this._createMapForMember(mapping, destinationKey, forMemberFn, fluentFunctions)
      }
    }

    return fluentFunctions
  }

  private _createMapForMember<TSource extends {} = any, TDestination extends {} = any>(
    mapping: Mapping<TSource, TDestination>,
    key: keyof TDestination,
    fn: ForMemberFunction<TSource, TDestination>,
    fluentFunctions: CreateMapFluentFunctions<TSource, TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination> {
    const mappingProperty: MappingProperty<TSource, TDestination> = {
      destinationKey: key,
      transformation: {
        transformationType: super.getTransformationType(fn),
        transformOptions: fn.arguments[0]
      }
    }

    mapping.properties.push(mappingProperty)

    return fluentFunctions
  }
}

export const Mapper = AutoMapper.getInstance()
