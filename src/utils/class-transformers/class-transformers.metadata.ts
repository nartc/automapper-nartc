export class MappableMetadata {
  constructor(public target: Function, public propertyName: string) {}
}

export class MappableTypeMetadata {
  constructor(
    public target: Function,
    public propertyName: string,
    public reflectedType: any,
    public typeFn: () => Function
  ) {}
}

class MetadataStorage {
  private _typeMetadatas = new Map<Function, Map<string, MappableTypeMetadata>>();
  private _mappableMetadatas = new Map<Function, Map<string, MappableMetadata>>();
  private _ancestorsMap = new Map<Function, Function[]>();

  addTypeMetadata(metadata: MappableTypeMetadata): void {
    if (!this._typeMetadatas.has(metadata.target)) {
      this._typeMetadatas.set(metadata.target, new Map<string, MappableTypeMetadata>());
    }
    // @ts-ignore
    this._typeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
  }

  addMappableMetadata(metadata: MappableMetadata): void {
    if (!this._mappableMetadatas.has(metadata.target)) {
      this._mappableMetadatas.set(metadata.target, new Map<string, MappableMetadata>());
    }
    // @ts-ignore
    this._mappableMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
  }

  findMappableMetadata(target: Function, propertyName: string): MappableMetadata | undefined {
    return this._findMetadata(this._mappableMetadatas, target, propertyName);
  }

  findTypeMetadata(target: Function, propertyName: string): MappableTypeMetadata | undefined {
    return this._findMetadata(this._typeMetadatas, target, propertyName);
  }

  findExposedProperties(target: Function): string[] {
    const metadata = this._mappableMetadatas.get(target);
    return metadata ? Array.from(metadata.values()).map(m => m.propertyName) : [];
  }

  private _findMetadata<T extends MappableMetadata>(
    metadatas: Map<Function, Map<string, T>>,
    target: Function,
    propertyName: string
  ): T | undefined {
    const metadataFromTargetMap = metadatas.get(target);
    if (metadataFromTargetMap) {
      const metadataFromTarget = metadataFromTargetMap.get(propertyName);
      if (metadataFromTarget) {
        return metadataFromTarget;
      }
    }
    for (const ancestor of this.getAncestors(target)) {
      const ancestorMetadataMap = metadatas.get(ancestor);
      if (ancestorMetadataMap) {
        const ancestorResult = ancestorMetadataMap.get(propertyName);
        if (ancestorResult) {
          return ancestorResult;
        }
      }
    }
    return undefined;
  }

  private getAncestors(target: Function): Function[] {
    if (!target) return [];
    if (!this._ancestorsMap.has(target)) {
      const ancestors: Function[] = [];
      for (
        let baseClass = Object.getPrototypeOf(target.prototype.constructor);
        typeof baseClass.prototype !== 'undefined';
        baseClass = Object.getPrototypeOf(baseClass.prototype.constructor)
      ) {
        ancestors.push(baseClass);
      }
      this._ancestorsMap.set(target, ancestors);
    }
    return this._ancestorsMap.get(target) || [];
  }
}

export const defaultMetadataStorage = new MetadataStorage();
