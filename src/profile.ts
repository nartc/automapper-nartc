import { Constructable, MappingProfile, CreateMapFluentFunctions } from './types';
import { Mapper } from './automapper';

export abstract class MappingProfileBase implements MappingProfile {
  public profileName: string;

  protected constructor() {
    this.profileName = this.constructor.name;
  }

  abstract configure(): void;

  protected createMap<TSource, TDestination>(
    source: Constructable<TSource>,
    destination: Constructable<TDestination>
  ): CreateMapFluentFunctions<TSource, TDestination> {
    return Mapper.createMap(source, destination);
  }
}
