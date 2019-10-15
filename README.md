# AutoMapper - Nartc

This is a fork of `automapper-ts` by [Bert Loedeman](https://github.com/loedeman). My goal is to re-create this awesome library with a more strong-type approach while learning `TypeScript` myself.

## Documentations

Github Pages
[https://nartc.github.io/automapper-nartc/](https://nartc.github.io/automapper-nartc/)

## Motivations

I know that `AutoMapper` is pretty weak in `TypeScript` because of how `Reflection` works in `TypeScript`. However, it'd be nice to have some type of `Mapper` that works for `NodeJS` development.

## Features

Features are limited since I am, by no mean, a `TypeScript` nor an `AutoMapper` expert which I'm planning to research more to provide more `AutoMapper` features to this library.

So far, the following is supported:

- [x] Basic Mapping between two classes
- [x] Basic Mapping for nested classes
- [x] Array/List Mapping
- [x] Flattening
- [x] ReverseMap - Very basic `reverseMapping` feature. Use for primitives models only if you can.
- [x] Value Converters
- [x] Value Resolvers
- [x] Async
- [x] Before/After Callback

**NOTE: Please be advised that the current state of this library is for learning purposes and I'd appreciate any help/guides. Everything is still in beta and DO NOT USE in production.**

#### Future features:

- [ ] Type Converters - Help needed
- [ ] Value Transformers
- [ ] Naming Conventions

#### Will not support:

- [x] Null Substitution - It makes more sense to use `fromValue()` instead of implement `nullSubstitution()`. Please let me know of a use-case where `nullSubstitution()` makes sense.

Contributions are appreciated.

#### Implementation note:

I have plans in the near future to update how `forMember()` method works in terms of the method's signature. I might change it to a lambda expression to support `reverseMapping` better. But I am open to suggestions.

## Installation

```shell
npm install --save automapper-nartc
```

**NOTE: `automapper-nartc` depends on `class-transformer` and `reflect-metadata`. `class-transformer` and `reflect-metadata` will also be installed when you install this library. Please also turn on `experimentalDecorators` and `emitDecoratorMetadata` in your `tsconfig` **

## Usage

1. Assuming you have couple of `Domain Models` as follows:

```typescript
class Address {
  address: string;
  city: string;
  state: string;
  zip: string;
}

class Profile {
  bio: string;
  phone: string;
  email: string;
  addresses: Address[];

  constructor() {
    this.addresses = [];
  }
}

class User {
  firstName: string;
  lastName: string;
  password: string;
  profile: Profile;
}
```

2. And you also have couple of `View Models` (or `DTOs`):

```typescript
class ProfileVm {
  bio: string;
  email: string;
  addressStrings: string[];
}

class UserVm {
  fullName: string;
  profile: ProfileVm;
  firstName?: string;
  lastName?: string;
}
```

3. Decorate all of your properties with `@Expose()`. `@Expose` is imported from `class-transformer`. This will allow the engine to be aware of all the properties available in a certain **class**.

```typescript
class User {
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
  @Expose()
  password: string;
  @Expose()
  profile: Profile;
}

class UserVm {
  @Expose()
  fullName: string;
  @Expose()
  profile: ProfileVm;
  @Expose()
  firstName?: string;
  @Expose()
  lastName?: string;
}
```

**NOTE: If you have nested model, like `profile` in this case, you will want to use `@Type()` on those as well. `@Type()` is also imported from `class-transformer`.**

```typescript
class User {
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
  @Expose()
  password: string;
  @Expose()
  @Type(() => Profile)
  profile: Profile;
}

class UserVm {
  @Expose()
  fullName: string;
  @Expose()
  @Type(() => ProfileVm)
  profile: ProfileVm;
  @Expose()
  firstName?: string;
  @Expose()
  lastName?: string;
}
```

However, `automapper-nartc` provides a short-hand decorator `@ExposedType()` instead of explicitly use `@Expose()` and `@Type()` on a nested model property.

```typescript
class UserVm {
  @Expose()
  fullName: string;
  @ExposedType(() => ProfileVm)
  profile: ProfileVm;
  @Expose()
  firstName?: string;
  @Expose()
  lastName?: string;
}
```

4. Next, import `Mapper` from `automapper-nartc`. You can also just instantiate a new instance of `AutoMapper` if you want to manage your instance.
5. Initialize `Mapper` with `initialize()` method. `initialize()` expects a `Configuration` callback that will give you access to the `Configuration` object. There are two methods on the `Configuration` object that you can use to setup your `Mapper`

- `createMap()`: `createMap()` expects a **source** as the first argument and the **destination** as the second argument. `createMap()` returns `CreateMapFluentFunctions<TSource, TDestination>` (Read more at [API Reference](https://nartc.github.io/automapper-nartc/index.html)).

```typescript
import { Mapper, MappingProfileBase } from 'automapper-nartc';

Mapper.initialize(config => {
  config.createMap(User, UserVm); // create a mapping from User to UserVm (one direction)
  config.createMap(Profile, ProfileVm)
    .forMember('addressStrings', opts => opts.mapFrom(s => s.addresses.map(... /* map to addressString however you like */)));
});
```

`createMap()` will establish basic mappings for: `primitives` and `nested mapping` that have the same field name on the **source** and **destination** (eg: `userVm.firstName` will be automatically mapped from `user.firstName`). In addition, you can use `forMember()` to gain more control on how to map a field on the **destination**.

```typescript
Mapper.initialize(config => {
  config
    .createMap(User, UserVm) // create a mapping from User to UserVm (one direction)
    .forMember('fullName', opts =>
      opts.mapFrom(source => source.firstName + ' ' + source.lastName)
    ); // You will get type-inference here
});
```

- `addProfile()`: `addProfile()` expects a new instance of a class which extends `MappingProfileBase`. Usually, you can just initialize your `Mapper` with `config.createMap` and setup all your mappings that way. But more than often, it is better to separate your mappings into `Profile` which will create the mappings for specific set of **source** and **destination**

```typescript
import { MappingProfileBase } from 'automapper-nartc';

export class UserProfile extends MappingProfileBase {
  constructor() {
    super(); // this is required since it will take UserProfile and get the string "UserProfile" to assign to profileName
  }

  // configure() is required since it is an abstract method. configure() will be called automatically by Mapper.
  // This is where you will setup your mapping with the class method: createMap
  configure(mapper: AutoMapper) {
    mapper
      .createMap(User, UserVm)
      .forMember('fullName', opts =>
        opts.mapFrom(source => source.firstName + ' ' + source.lastName)
      ); // You will get type-inference here
  }
}

// in another file
Mapper.initialize(config => {
  config.addProfile(new UserProfile());
});
```

5. When you're ready to map, call `Mapper.map()`.

```typescript
const userVm = Mapper.map(user, UserVm); // this will return an instance of UserVm and assign it to userVm with all the fields assigned properly from User

console.log('instance of UserVm?', userVm instanceof UserVm); // true
```

#### Callbacks

`automapper-nartc` provides `beforeMap` and `afterMap` callbacks which are called **before** a mapping operator occurs and/or **after** a mapping operator occurs, if said callbacks are provided.

There are two ways you can provide the callbacks: `Map` level and `Mapping` level.

**NOTE: `Map` level refers to the actual map operation when any of the `map()` methods are called. `Mapping` level refers to the actual `Mapping` between two models when `createMap()` is called.**

- **Map** level: all `map()` methods have the third parameter which has a shape of `MapActionOptions: {beforeMap: Function, afterMap: Function}`. If any of the callbacks is provided, it will be called in correct chronological order.

```typescript
/**
 * In this case, both callbacks will be called with the following arguments.
 *
 * @param {User} source
 * @param {UserVm} destination
 * @param {Mapping<User, UserVm>} mapping
 */
const userVm = Mapper.map(user, UserVm, {
  beforeMap: (source, destination, mapping) => {},
  afterMap: (source, destination, mapping) => {}
});
```

- **Mapping** level: callbacks on the `Mapping` level will be called for ALL map operations on the two models unless you provide diferent callbacks to specific `map` operation (aka `Map` level)

```typescript
/**
 * In this case, both callbacks will be called with the following arguments.
 *
 * @param {User} source
 * @param {UserVm} destination
 * @param {Mapping<User, UserVm>} mapping
 */
Mapper.initialize(config => {
  config
    .createMap(User, UserVm)
    .beforeMap((source, destination, mapping) => {})
    .afterMap((source, destination, mapping) => {}); // create a mapping from User to UserVm (one direction)
});
```

**NOTE 1: `Map` level callbacks will overide `Mapping` level callbacks if both are provided**

**NOTE 2: The callbacks are called with `source`, `destination` and `mapping`. **ANYTHING** you do to the `source` and `destination` will be carried over to the `source` and `destination` being mapped (mutation) so please be cautious. It might be handy/dangerous at the same time given the dynamic characteristic of **JavaScript**.**

**NOTE 3: `mapArray()` will ignore `Mapping` level callbacks because that would be a performance issue if callbacks were to be called on every single item in an array. Provide `Map` level callbacks for `mapArray()` if you want to have callbacks on `mapArray()`**

6. Use `Mapper.mapArray()` if you want to map from `TSource[]` to `TDestination[]`.

## Demo

Codesandbox Demo
[Codesandbox](https://codesandbox.io/s/automapper-nartc-example-l96nw)
