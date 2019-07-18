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

> Please be advised that the current state of this library is for learning purposes and I'd appreciate any help/guides. Everything is still in beta and DO NOT USE in production.

#### Future features:

- [ ] ReverseMap
- [ ] Type Converters
- [ ] Value Resolvers
- [ ] Value Converters ?
- [ ] Value Transformers ?
- [ ] Null Substitution
- [ ] Naming Conventions

Contributions are appreciated.

## Installation

```shell
npm install --save automapper-nartc
```

> Again, I'm still in the learning process. The library makes use of [typescript-library-start](https://github.com/alexjoverm/typescript-library-starter) which is awesome. But I do feel like something is missing. For example, typings files are separated.

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
class AddressVm {
  constructor(public addressString: string) {}
}

class ProfileVm {
  constructor(public bio: string, public email: string, public addressStrings: AddressVm[]) {}
}

class UserVm {
  constructor(
    public fullName: string,
    public profile: ProfileVm,
    public firstName?: string,
    public lastName?: string
  ) {}
}
```

> You have to use the short-hand version to declare your Class fields. This will make sure the Object will be instantiated with all fields available.

3. Next, import `Mapper` from `automapper-nartc`
4. Initialize `Mapper` with `initialize()` method. `initialize()` expects a `Configuration` callback that will give you access to the `Configuration` object. There are two methods on the `Configuration` object that you can use to setup your `Mapper`

- `createMap()`: `createMap()` expects a **source** as the first argument and the **destination** as the second argument. `createMap()` returns `CreateMapFluentFunctions<TSource, TDestination>` (Read more at [API Reference](https://nartc.github.io/automapper-nartc/index.html)).

```typescript
import { Mapper, MappingProfileBase } from 'automapper-nartc';

Mapper.initialize(config => {
  config.createMap(User, UserVm); // create a mapping from User to UserVm (one direction)
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
  configure() {
    this.createMap(User, UserVm).forMember('fullName', opts =>
      opts.mapFrom(source => source.firstName + ' ' + source.lastName)
    ); // You will get type-inference here
  }
}

// in another file
Mapper.initialize(config => {
  config.addProfile(new UserProfile());
});
```

5. When you're ready to map, call `Mapper.map()`. `map()` has two overloads:

- `map(sourceObj, destination)`
- `map(sourceObj, source, destination)`

```typescript
const userVm = Mapper.map(user, UserVm); // this will return an instance of UserVm and assign it to userVm with all the fields assigned properly from User

console.log('instance of UserVm?', userVm instanceof UserVm); // true
```

6. Use `Mapper.mapArray()` if you want to map from `TSource[]` to `TDestination[]`. `mapArray()` has the same overloads as `map()`

## Demo

Stackblitz Demo
[Stackblitz](https://stackblitz.com/edit/typescript-automapper-nartc)
