# AutoMapper - Nartc

This is a fork of `automapper-ts` by [Bert Loedeman](https://github.com/loedeman). My goal is to re-create this awesome library with a more strong-type approach while learning `TypeScript` myself.

## Documentations

Github Pages
[https://nartc.github.io/automapper-nartc/](https://nartc.github.io/automapper-nartc/)

Stackblitz Demo
[Stackblitz](https://stackblitz.com/edit/typescript-automapper-nartc)

## Motivations

I know that `AutoMapper` is pretty weak in `TypeScript` because of how `Reflection` works in `TypeScript`. However, it'd be nice to have some type of `Mapper` that works for `NodeJS` development.

## Features

Features are limited since I am, by no mean, a `TypeScript` nor an `AutoMapper` expert which I'm planning to research more to provide more `AutoMapper` features to this library.

So far, the following is supported:

- [x] Basic Mapping between two classes
- [x] Basic Mapping for nested classes
- [x] Array/List Mapping

> Please be advised that the current state of this library is for learning purposes and I'd appreciate any help/guides. Everything is still in beta and DO NOT USE in production.

#### Features that I am working on:

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

class Address {
  address: string;
  city: string;
  state: string;
  zip: string;
}

class AddressVm {
  constructor(public addressString: string) {}
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

class ProfileVm {
  constructor(public bio: string, public email: string, public addressStrings: AddressVm[]) {}
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
  ) {}
}

class UserProfile extends MappingProfileBase {
  constructor() {
    super();
  }

  configure(): void {
    this.createMap(User, UserVm).forMember('fullName', opts =>
      opts.mapFrom(source => source.firstName + ' ' + source.lastName)
    );
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

class AddressProfile extends MappingProfileBase {
  constructor() {
    super();
  }

  configure(): void {
    this.createMap(Address, AddressVm).forMember('addressString', opts =>
      opts.mapFrom(s => `${s.address}, ${s.city} ${s.state}, ${s.zip}`)
    );
  }
}

Mapper.initialize(config => {
  config.addProfile(new UserProfile());
  config.addProfile(new ProfileProfile());
  config.addProfile(new AddressProfile());
});

const user = new User();
user.firstName = 'Chau';
user.lastName = 'Tran';
user.password = '123456';

const address1 = new Address();
address1.address = '123 Some';
address1.city = 'Acme';
address1.state = 'AC';
address1.zip = '12345';

const address2 = new Address();
address2.address = '123 Some';
address2.city = 'Acme';
address2.state = 'AC';
address2.zip = '12345';

user.profile = new Profile();
user.profile.bio = 'Test bio';
user.profile.email = 'Test email';
user.profile.phone = 'test phone';
user.profile.addresses.push(address1, address2);

console.log(user);
/**
 * 
User {
  firstName: 'Chau',
  lastName: 'Tran',
  password: '123456',
  profile: Profile {
    addresses: [ [Address], [Address] ],
    bio: 'Test bio',
    email: 'Test email',
    phone: 'test phone'
  }
}
 */

const userVm = Mapper.map(User, UserVm, user);
console.log(userVm);
/**
UserVm {
  fullName: 'Chau Tran',
  profile: ProfileVm {
    bio: 'Test bio',
    email: 'Test email',
    addressStrings: undefined
  },
  firstName: 'Chau',
  lastName: 'Tran'
}
 */

userVm.profile.addressStrings = Mapper.mapArray(Address, AddressVm, user.profile.addresses);

console.log(userVm);
/**
UserVm {
  fullName: 'Chau Tran',
  profile: ProfileVm {
    bio: 'Test bio',
    email: 'Test email',
    addressStrings: [ [AddressVm], [AddressVm] ]
  },
  firstName: 'Chau',
  lastName: 'Tran'
}
 */

console.log(userVm.profile);
/**
ProfileVm {
  bio: 'Test bio',
  email: 'Test email',
  addressStrings: [
    AddressVm { addressString: '123 Some, Acme AC, 12345' },
    AddressVm { addressString: '123 Some, Acme AC, 12345' }
  ]
}
 */

console.log('instance of UserVm?', userVm instanceof UserVm); // true
console.log('instance of ProfileVm?', userVm.profile instanceof ProfileVm); // true
console.log('instance of AddressVm?', userVm.profile.addressStrings[0] instanceof AddressVm); // true
```
