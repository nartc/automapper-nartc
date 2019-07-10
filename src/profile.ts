import { CamelCaseNamingConvention } from './naming/camel-case-naming-convention'
import { Constructable, CreateMapFluentFunctions, MappingProfile, NamingConvention } from './types'
import { Mapper } from './automapper'

export abstract class MappingProfileBase implements MappingProfile {
  public profileName: string
  destinationMemberNamingConvention: NamingConvention = new CamelCaseNamingConvention()
  sourceMemberNamingConvention: NamingConvention = new CamelCaseNamingConvention()

  protected constructor() {
    this.profileName = this.constructor.name
  }

  abstract configure(): void

  protected createMap<TSource, TDestination>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination> {
    return Mapper.createMap(source, destination)
  }
}
