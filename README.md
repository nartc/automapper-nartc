# AutoMapper - Nartc

This is a fork of `automapper-ts` by [Bert Loedeman](https://github.com/loedeman). My goal is to re-create this awesome library with a more strong-type approach while learning `TypeScript` myself.

## Documentations
[https://nartc.github.io/automapper-nartc/](https://nartc.github.io/automapper-nartc/)

## Motivations

I know that `AutoMapper` is pretty weak in `TypeScript` because of how `Reflection` works in `TypeScript`. However, it'd be nice to have some type of `Mapper` that works for `NodeJS` development.

## Features

Features are limited since I am, by no mean, a `TypeScript` nor an `AutoMapper` expert which I'm planning to research more to provide more `AutoMapper` features to this library.

So far, the following is supported:
- [x] Basic Mapping between two classes
- [x] Basic Mapping for nested classes

> Please be advised that the current state of this library is for learning purposes and I'd appreciate any help/guides. Everything is still in beta and DO NOT USE in production.

#### Features that I am working on:
- [ ] Array/List Mapping
- [ ] ReverseMap
- [ ] I don't know, I'll need to research `AutoMapper` more

## Installation

```shell
npm install --save automapper-nartc
```

> Again, I'm still in the learning process. The library makes use of [typescript-library-start](https://github.com/alexjoverm/typescript-library-starter) which is awesome. But I do feel like something is missing. For example, typings files are separated.

## Usage

```typescript
import { Mapper, MappingProfileBase } from 'automapper-nartc';

class Profile {
  bio: string;
  phone: string;
  email: string;
  address: string;
}

class ProfileVm {
  constructor(
    public bio: string,
    public email: string
  ) {
  }
}

class User {
  firstName: string;
  lastName: string;
  password: string;
  profile: Profile;
}

class UserVm {
  constructor(
    public fullName: string,
    public profile: ProfileVm,
    public firstName?: string,
    public lastName?: string
  ) {
  }
}

class UserProfile extends MappingProfileBase {
  constructor() {
    super();
  }

  configure(): void {
    this.createMap(User, UserVm)
      .forMember('fullName', opts => opts.mapFrom(source => source.firstName + ' ' + source.lastName));
  }
}

class ProfileProfile extends MappingProfileBase {
  constructor() {
    super();
  }

  configure(): void {
    this.createMap(Profile, ProfileVm);
  }
}

Mapper.initialize(config => {
  config.addProfile(new UserProfile());
  config.addProfile(new ProfileProfile());
});

const user = new User();
user.firstName = 'Chau';
user.lastName = 'Tran';
user.password = '123456';
user.profile = new Profile();
user.profile.bio = 'Test bio';
user.profile.address = 'Test address';
user.profile.email = 'Test email';
user.profile.phone = 'test phone';

const userVm = Mapper.map(User, UserVm, user);
console.log(userVm);
console.log('instance of UserVm?', userVm instanceof UserVm);
console.log('instance of ProfileVm?', userVm.profile instanceof ProfileVm);
```
