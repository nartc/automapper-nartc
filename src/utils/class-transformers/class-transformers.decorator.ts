import {
  defaultMetadataStorage,
  MappableMetadata,
  MappableTypeMetadata
} from './class-transformers.metadata';

export const Mappable = () => (target: Object | Function, propertyName: string) => {
  defaultMetadataStorage.addMappableMetadata(
    new MappableMetadata(target instanceof Function ? target : target.constructor, propertyName)
  );
};

export const MappableType = (typeFn: () => Function) => (target: any, propertyName: string) => {
  const reflectedType = Reflect.getMetadata('design:type', target, propertyName);
  Mappable()(target, propertyName);
  defaultMetadataStorage.addTypeMetadata(
    new MappableTypeMetadata(target.constructor, propertyName, reflectedType, typeFn)
  );
};
