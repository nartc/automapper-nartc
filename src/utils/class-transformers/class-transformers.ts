import 'reflect-metadata';
import { defaultMetadataStorage } from './class-transformers.metadata';

const getKeys = (target: Function, obj: any): string[] => {
  let keys: string[] = Object.keys(obj).concat(
    defaultMetadataStorage.findExposedProperties(target)
  );
  return keys.filter((key, index, self) => self.indexOf(key) === index);
};

export const toClass = <T>(targetType: Function, sourceObj: T): T => {
  const keys = getKeys(targetType, sourceObj);
  // noinspection JSPotentiallyInvalidConstructorUsage
  const newValue = new (targetType as any)() as T;

  for (const key of keys) {
    const sourceVal = (sourceObj as any)[key];
    const isArray = sourceVal && Array.isArray(sourceVal);
    const typeMetadata = defaultMetadataStorage.findTypeMetadata(targetType, key);

    if (typeMetadata) {
      const nestedType = typeMetadata.typeFn
        ? typeMetadata.typeFn()
        : (typeMetadata.reflectedType as Function);
      // noinspection JSPotentiallyInvalidConstructorUsage
      (newValue as any)[key] = isArray
        ? sourceVal.map((item: any) => toClass(nestedType, item))
        : toClass(nestedType, sourceVal || new (nestedType as any)());
      continue;
    }

    (newValue as any)[key] = isArray ? sourceVal.slice() : sourceVal ? sourceVal : undefined;
  }
  return newValue;
};
