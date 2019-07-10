declare module 'automapper-nartc/automapper' {
  import { AutoMapperBase } from 'automapper-nartc/base';
  import { Configuration, Constructable, CreateMapFluentFunctions } from 'automapper-nartc/types';
  export class AutoMapper extends AutoMapperBase {
      private static _instance;
      private readonly _mappings;
      private readonly _profiles;
      static getInstance(): AutoMapper;
      constructor();
      initialize(configFn: (config: Configuration) => void): void;
      createMap<TSource, TDestination>(source: Constructable<TSource>, destination: Constructable<TDestination>): CreateMapFluentFunctions<TSource, TDestination>;
      map<TSource, TDestination>(source: Constructable<TSource>, destination: Constructable<TDestination>, sourceObj: TSource): any;
      private mapInternal;
      private mapArray;
      private mapItem;
      private mapProperty;
      private transform;
      private processTransformation;
      private createMappingObjectForArgs;
      private createMapGetFluentApiFunctions;
      private createMapForMember;
      private createMapForAllMembers;
      private createMapIgnoreAllNonExisting;
      private createMapConvertToType;
      private createMapWithProfile;
      private createMapWithProfileMergeMappings;
      private createSourceProperty;
      private createDestinationProperty;
      private mergeSourceProperty;
      private mergeDestinationProperty;
  }
  export const Mapper: AutoMapper;

}
declare module 'automapper-nartc/base' {
  import { Constructable, CreateMapFluentFunctions, DestinationMappingProperty, DestinationMemberConfigurationOptions, Mapping, MemberCallback } from 'automapper-nartc/types';
  export abstract class AutoMapperBase {
      abstract map<TSource, TDestination>(source: Constructable<TSource>, destination: Constructable<TDestination>, sourceObj: TSource): TDestination;
      abstract createMap<TSource, TDestination>(source: Constructable<TSource>, destination: Constructable<TDestination>): CreateMapFluentFunctions<TSource, TDestination>;
      protected getMapping<TSource, TDestination>(mappings: {
          [key: string]: Mapping<TSource, TDestination>;
      }, source: Constructable<TSource>, destination: Constructable<TDestination>): Mapping<TSource, TDestination>;
      protected isArray<TSource>(sourceObject: TSource): boolean;
      protected handleArray<TSource, TDestination>(mapping: Mapping<TSource, TDestination>, sourceArray: TSource[], itemFunc: (sourceObj: TSource, destinationObj: TDestination) => void): TDestination[];
      protected handleItem<TSource, TDestination>(mapping: Mapping<TSource, TDestination>, sourceObj: TSource, destinationObj: TDestination, propFunc: (propName: string) => void): TSource | TDestination;
      protected handleProperty<TSource, TDestination>(mapping: Mapping<TSource, TDestination>, sourceObj: TSource, sourcePropName: keyof TSource, destinationObj: TDestination, transformFn: (destinationProperty: DestinationMappingProperty<TSource, TDestination>, memberOptions: DestinationMemberConfigurationOptions<TSource, TDestination>, callback?: MemberCallback<TDestination>) => void, autoMappingCbFn?: (destinationPropVal: TDestination[keyof TDestination]) => void): void;
      protected createDestinationObject<TDestination>(destination: Constructable<TDestination>): TDestination;
      protected setPropertyValue<TSource, TDestination>(mapping: Mapping<TSource, TDestination>, destinationProperty: DestinationMappingProperty<TSource, TDestination>, destinationObj: TDestination, destinationPropVal: TDestination[keyof TDestination]): void;
      protected setPropertyValueByName<TSource, TDestination>(mapping: Mapping<TSource, TDestination>, destinationObj: TDestination, destinationPropName: keyof TDestination, destinationPropVal: TDestination[keyof TDestination]): void;
      protected shouldProcessDestination<TSource, TDestination>(destination: DestinationMappingProperty<TSource, TDestination>, sourceObj: TSource): boolean;
      private handlePropertyWithAutoMapping;
      private getDestinationPropertyName;
      private getDestinationPropertyValue;
      private getPropertyMappings;
      private processMappedProperty;
      private createMemberConfigurationOptions;
  }

}
declare module 'automapper-nartc/helpers' {
  import { ConditionPredicate, DestinationMappingProperty, DestinationMappingTransformation, DestinationMemberConfigurationOptions, ForMemberFn, ForMemberValueOrFunction, MappingProperty, MemberCallback, MemberMappingMetadata, SourceMappingProperty, SourceMemberConfigurationOptions } from 'automapper-nartc/types';
  export const handleCurrying: (fn: Function, args: IArguments, closure: any) => any;
  export const getMappingMetadata: <TSource, TDestination>(sourceFn: ForMemberFn<any>, transformation: TDestination[keyof TDestination] | ((opts: DestinationMemberConfigurationOptions<TSource, TDestination>) => any) | ((opts: DestinationMemberConfigurationOptions<TSource, TDestination>, cb: MemberCallback<TDestination>) => any) | ((opts: SourceMemberConfigurationOptions<TSource>) => any) | ((opts: SourceMemberConfigurationOptions<TSource>, cb: MemberCallback<TSource>) => any), sourceMapping: boolean) => MemberMappingMetadata<TSource, TDestination>;
  export const getDestinationTransformation: <TSource, TDestination>(transformation: TDestination[keyof TDestination] | ((opts: DestinationMemberConfigurationOptions<TSource, TDestination>) => any) | ((opts: DestinationMemberConfigurationOptions<TSource, TDestination>, cb: MemberCallback<TDestination>) => any) | ((opts: SourceMemberConfigurationOptions<TSource>) => any) | ((opts: SourceMemberConfigurationOptions<TSource>, cb: MemberCallback<TSource>) => any), isFunction: boolean, sourceMapping: boolean, async: boolean) => DestinationMappingTransformation<TSource, TDestination>;
  export const getFunctionParameters: (fnString: string) => string[];
  export const getMapFromString: (fnString: string, defaultValue: string, optionsParamName: string) => string;
  export const getFunctionCallIndex: (fnString: string, fnToLookFor: string, optionsParamName: string) => number;
  export const getIgnoreFromString: (fnString: string, optionsParameterName: string) => boolean;
  export const getConditionFromFunction: <TSource, TDestination>(transformation: ForMemberValueOrFunction<TSource, TDestination>, sourceProp: keyof TSource) => ConditionPredicate<TSource>;
  export const findProperty: <TSource, TDestination>(name: string, existingProperties: SourceMappingProperty<TSource, TDestination>[]) => MappingProperty<TSource, TDestination> | null;
  export const matchSourcePropertyByDestination: <TSource, TDestination>(property: SourceMappingProperty<TSource, TDestination>, existingProperties: SourceMappingProperty<TSource, TDestination>[]) => SourceMappingProperty<TSource, TDestination> | null;
  export const getDestinationProperty: <TSource, TDestination>(destinationPropertyName: keyof TDestination, existingSource: SourceMappingProperty<TSource, TDestination>) => DestinationMappingProperty<TSource, TDestination> | null;
  export const handleMapFromProperties: <TSource, TDestination>(property: MappingProperty<TSource, TDestination>, existing: MappingProperty<TSource, TDestination>) => boolean;

}
declare module 'automapper-nartc/index' {
  export * from 'automapper-nartc/naming/camel-case-naming-convention';
  export * from 'automapper-nartc/naming/pascal-case-naming-convention';
  export * from 'automapper-nartc/base';
  export * from 'automapper-nartc/profile';
  export * from 'automapper-nartc/types';
  export * from 'automapper-nartc/automapper';

}
declare module 'automapper-nartc/naming/camel-case-naming-convention' {
  import { NamingConvention } from 'automapper-nartc/types';
  export class CamelCaseNamingConvention implements NamingConvention {
      separatorCharacter: string;
      splittingExpression: RegExp;
      transformPropertyName(sourceNameParts: string[]): string;
  }

}
declare module 'automapper-nartc/naming/pascal-case-naming-convention' {
  import { NamingConvention } from 'automapper-nartc/types';
  export class PascalCaseNamingConvention implements NamingConvention {
      separatorCharacter: string;
      splittingExpression: RegExp;
      transformPropertyName(sourceNameParts: string[]): string;
  }

}
declare module 'automapper-nartc/profile' {
  import { Constructable, CreateMapFluentFunctions, MappingProfile, NamingConvention } from 'automapper-nartc/types';
  export abstract class MappingProfileBase implements MappingProfile {
      profileName: string;
      destinationMemberNamingConvention: NamingConvention;
      sourceMemberNamingConvention: NamingConvention;
      protected constructor();
      abstract configure(): void;
      protected createMap<TSource, TDestination>(source: Constructable<TSource>, destination: Constructable<TDestination>): CreateMapFluentFunctions<TSource, TDestination>;
  }

}
declare module 'automapper-nartc/types' {
  export enum DestinationTransformationType {
      Constant = 1,
      MemberOptions = 2,
      AsyncMemberOptions = 4,
      SourceMemberOptions = 8,
      AsyncSourceMemberOptions = 16
  }
  export type Constructable<T> = new (...args: any[]) => T;
  export type MemberMappingMetadata<TSource, TDestination> = {
      destination: keyof TDestination;
      source: keyof TSource;
      transformation: DestinationMappingTransformation<TSource, TDestination>;
      sourceMapping: boolean;
      ignore: boolean;
      async: boolean;
      condition?: ConditionPredicate<TSource>;
  };
  export type MappingProperty<TSource, TDestination> = {
      name: string;
      sourcePropertyName: keyof TSource;
      destinationPropertyName: keyof TDestination;
      level: number;
  };
  export type SourceMappingProperty<TSource, TDestination> = {
      children: Array<SourceMappingProperty<TSource, TDestination>>;
      destination?: DestinationMappingProperty<TSource, TDestination>;
  } & MappingProperty<TSource, TDestination>;
  export type DestinationMappingProperty<TSource, TDestination> = {
      transformations: Array<DestinationMappingTransformation<TSource, TDestination>>;
      ignore: boolean;
      child?: DestinationMappingProperty<TSource, TDestination>;
      conditionFn?: ConditionPredicate<TSource>;
      sourceMapping: boolean;
  } & MappingProperty<TSource, TDestination>;
  export type DestinationMappingTransformation<TSource, TDestination> = {
      transformationType: DestinationTransformationType;
      constant?: ReturnType<ForMemberFn<TDestination>>;
      memberConfigurationOptionsFn?: (opts: DestinationMemberConfigurationOptions<TSource, TDestination>) => void;
      asyncMemberConfigurationOptionsFn?: (opts: DestinationMemberConfigurationOptions<TSource, TDestination>, cb: MemberCallback<TDestination>) => void;
      sourceMemberConfigurationOptionsFn?: (opts: SourceMemberConfigurationOptions<TSource>) => void;
      asyncSourceMemberConfigurationOptionsFn?: (opts: SourceMemberConfigurationOptions<TSource>, cb: MemberCallback<TSource>) => void;
  };
  export type MapItemFn<TSource, TDestination> = (mapping: Mapping<TSource, TDestination>, source: TSource, destination: TDestination) => TDestination;
  export type Mapping<TSource extends {} = any, TDestination extends {} = any> = {
      sourceTypeClass: Constructable<TSource>;
      destinationTypeClass: Constructable<TDestination>;
      sourceKey: string;
      destinationKey: string;
      forAllMembersMappings: Array<ForAllMembersFn<TDestination>>;
      properties: Array<SourceMappingProperty<TSource, TDestination>>;
      /**
       * TODO: To be implemented
       */
      typeConverterFn: any;
      profile?: MappingProfile;
      ignoreAllNonExisting?: boolean;
      async: boolean;
      mapItemFn: MapItemFn<TSource, TDestination>;
  };
  export type MapFromCallback<TSource, TDestination> = (source: TSource) => ReturnType<ForMemberFn<TDestination>>;
  export type ConditionPredicate<TSource> = (source: TSource) => boolean;
  export type MemberCallback<TDestination> = (cbValue: ReturnType<ForMemberFn<TDestination>>) => void;
  export type ForMemberFn<TDestination> = (destination: TDestination) => TDestination[keyof TDestination];
  export type ForSourceMemberFn<TSource> = ((opts: SourceMemberConfigurationOptions<TSource>) => any) | ((opts: SourceMemberConfigurationOptions<TSource>, cb: MemberCallback<TSource>) => any);
  export type ForMemberValueOrFunction<TSource, TDestination> = ReturnType<ForMemberFn<TDestination>> | ((opts: DestinationMemberConfigurationOptions<TSource, TDestination>) => any) | ((opts: DestinationMemberConfigurationOptions<TSource, TDestination>, cb: MemberCallback<TDestination>) => any);
  export type ForAllMembersFn<TDestination> = (source: TDestination, key: keyof TDestination, value: any) => void;
  export type MappingConfigurationOptions<TSource> = {
      sourceObject: Partial<TSource>;
      sourcePropertyName: keyof TSource;
      intermediatePropertyValue?: any;
  };
  export type SourceMemberConfigurationOptions<TSource> = {
      ignore: () => void;
  } & MappingConfigurationOptions<TSource>;
  export type DestinationMemberConfigurationOptions<TSource, TDestination> = {
      mapFrom: (mapFromCb: MapFromCallback<TSource, TDestination>) => void;
      condition: (predicate: ConditionPredicate<TSource>) => void;
  } & SourceMemberConfigurationOptions<TSource>;
  export type CreateMapFluentFunctions<TSource, TDestination> = {
      forMember: (forMemberFn: ForMemberFn<TDestination>, valueOrFunction: ForMemberValueOrFunction<TSource, TDestination>) => CreateMapFluentFunctions<TSource, TDestination>;
      forSourceMember: (forSourceMemberFn: ForMemberFn<TSource>, configFunction: ForSourceMemberFn<TSource>) => CreateMapFluentFunctions<TSource, TDestination>;
      forAllMembers: (fn: ForAllMembersFn<TDestination>) => CreateMapFluentFunctions<TSource, TDestination>;
      ignoreAllNonExisting: () => CreateMapFluentFunctions<TSource, TDestination>;
      /**
       * TODO: To be implemented
       */
      convertUsing: () => void;
      convertToType: (typeClass: new () => TDestination) => CreateMapFluentFunctions<TSource, TDestination>;
      withProfile: (profile: MappingProfile) => void;
  };
  export type NamingConvention = {
      splittingExpression: RegExp;
      separatorCharacter: string;
      transformPropertyName: (sourcePropNameParts: string[]) => string;
  };
  export interface MappingProfile {
      profileName: string;
      sourceMemberNamingConvention: NamingConvention;
      destinationMemberNamingConvention: NamingConvention;
      configure: () => void;
  }
  export type Configuration = {
      addProfile: (profile: MappingProfile) => void;
      createMap: <TSource, TDestination>(source: Constructable<TSource>, destination: Constructable<TDestination>) => CreateMapFluentFunctions<TSource, TDestination>;
  };

}
declare module 'automapper-nartc' {
  import main = require('automapper-nartc/index');
  export = main;
}