import { Expose } from 'class-transformer';
import 'reflect-metadata';
import { AutoMapper, Converter, ExposedType, Mapper, MappingProfileBase } from '../src';

class User {
  @Expose()
  firstName!: string;
  @Expose()
  lastName!: string;
  @ExposedType(() => Nested)
  nested!: Nested;
}

class UserVm {
  @Expose()
  firstName!: string;
  @Expose()
  lastName!: string;
  @Expose()
  fullName!: string;
  @ExposedType(() => NestedVm)
  nested!: NestedVm;
}

class Address {
  @Expose()
  street!: string;
  @Expose()
  city!: string;
  @Expose()
  state!: string;
}

class AddressVm {
  @Expose()
  addressString!: string;
}

class Profile {
  @Expose()
  bio!: string;
  @Expose()
  avatar!: string;
}

class ProfileVm {
  @Expose()
  avatarUrl!: string;
}

class Nested {
  @Expose()
  foo!: string;
  @Expose()
  foobar!: number;
  @Expose()
  foobaz!: boolean;
  @Expose()
  foobarbar!: number;
  @Expose()
  foofoobarbar!: string;
}

class NestedVm {
  @Expose()
  bar!: string;
  @Expose()
  barfoo!: number;
  @Expose()
  bazfoo!: boolean;
  @Expose()
  barbarfoo!: number;
  @Expose()
  barbarfoofoo!: Date;
}

class DateFormatter implements Converter<string, Date> {
  convert(source: string): Date {
    return new Date(source);
  }
}

class StringFormatter implements Converter<Date, string> {
  convert(source: Date): string {
    return source.toISOString();
  }
}

class AddressProfile extends MappingProfileBase {
  constructor() {
    super();
  }

  configure(mapper: AutoMapper): void {
    mapper
      .createMap(Address, AddressVm)
      .forMember('addressString', opts =>
        opts.mapFrom(s => s.street + ' ' + s.city + ' ' + s.state)
      );
  }
}

describe('automapper-nartc', () => {
  it('AutoMapper exposes a singleton', () => {
    expect(Mapper).toBeInstanceOf(AutoMapper);
    const _instance = AutoMapper.getInstance();
    expect(_instance).toBeInstanceOf(AutoMapper);
    expect(_instance).toBe(Mapper);
  });

  it('AutoMapper is instantiable', () => {
    const _mapper = new AutoMapper();
    expect(_mapper).toBeInstanceOf(AutoMapper);
    expect(_mapper).not.toBe(Mapper);
  });

  it('AutoMapper instance is disposable', () => {
    const _mapper = new AutoMapper();

    Mapper.createMap(Profile, ProfileVm)
      .reverseMap()
      .forPath(d => d.avatar, opts => opts.mapFrom(s => s.avatarUrl))
      .forPath(d => d.bio, opts => opts.ignore());
    Mapper.initialize(cfg => {
      cfg.createMap(User, UserVm);
      cfg.addProfile(new AddressProfile());
    });

    expect(Mapper).not.toEqual(_mapper);
    Mapper.dispose();
    expect(Mapper).toEqual(_mapper);
  });

  it('AutoMapper fluent API for Profile', () => {
    const _instance = Mapper.addProfile(new AddressProfile());
    expect(_instance).toBeInstanceOf(AutoMapper);
    expect(_instance).toEqual(Mapper);
    Mapper.dispose();
  });

  it('AutoMapper fluent API throw error for adding duplicate Profile', () => {
    const profile = new AddressProfile();
    let message: string = '';
    try {
      Mapper.addProfile(profile).addProfile(profile);
    } catch (e) {
      message = e.message;
    }

    expect(message).toBeDefined();
    expect(message).toEqual(
      `${profile.profileName} is already existed on the current Mapper instance`
    );

    Mapper.dispose();
  });
});

describe('automapper-nartc: mapping', () => {
  let user: User;
  let users: User[] = [];
  let address: Address;
  let addresses: Address[] = [];
  let profile: Profile;
  let profiles: Profile[] = [];

  beforeEach(() => {
    Mapper.createMap(Profile, ProfileVm)
      .forMember('avatarUrl', opts => opts.mapFrom(s => s.avatar))
      .reverseMap()
      .forPath(d => d.avatar, opts => opts.mapFrom(s => s.avatarUrl))
      .forPath(d => d.bio, opts => opts.ignore());
    Mapper.initialize(cfg => {
      cfg
        .createMap(Nested, NestedVm)
        .forMember('bar', opts => opts.mapFrom(s => s.foo))
        .forMember('barfoo', opts => opts.ignore())
        .forMember('bazfoo', opts => opts.fromValue(false))
        .forMember('barbarfoo', opts => opts.condition(s => s.foobaz))
        .forMember('barbarfoofoo', opts =>
          opts.convertUsing(new DateFormatter(), source => source.foofoobarbar)
        )
        .reverseMap()
        .forPath(s => s.foobarbar, opts => opts.ignore())
        .forPath(s => s.foobar, opts => opts.condition(d => d.bazfoo))
        .forPath(s => s.foobaz, opts => opts.fromValue(true))
        .forPath(
          s => s.foofoobarbar,
          opts => opts.convertUsing(new StringFormatter(), source => source.barbarfoofoo)
        );
      cfg
        .createMap(User, UserVm)
        .forMember('fullName', opts => opts.mapFrom(s => s.firstName + ' ' + s.lastName))
        .forMember('nested', opts => opts.mapWith(NestedVm, source => source.nested))
        .reverseMap()
        .forPath(s => s.nested, opts => opts.mapWith(Nested, source => source.nested));
      cfg.addProfile(new AddressProfile());
    });

    user = new User();
    user.firstName = 'Chau';
    user.lastName = 'Tran';
    user.nested = new Nested();
    user.nested.foo = 'foo';

    address = new Address();
    address.street = 'Some';
    address.city = 'City';
    address.state = 'State';

    profile = new Profile();
    profile.bio = 'Some bio';
    profile.avatar = 'Some link';

    users.push(user);
    addresses.push(address);
    profiles.push(profile);
  });

  afterEach(() => {
    Mapper.dispose();
    users = [];
    addresses = [];
    profiles = [];
  });

  it('map with createMap', () => {
    const vm = Mapper.map(profile, ProfileVm);
    expect(vm.avatarUrl).toEqual(profile.avatar);
    expect(vm).toBeInstanceOf(ProfileVm);
  });

  it('simple reverseMap', () => {
    const vm = Mapper.map(profile, ProfileVm);
    const _profile = Mapper.map(vm, Profile);

    expect(_profile).toBeDefined();
    expect(_profile.bio).toBeFalsy();
    expect(_profile.avatar).toEqual(vm.avatarUrl);
    expect(_profile).toBeInstanceOf(Profile);
  });

  it('map with config.createMap', () => {
    const vm = Mapper.map(user, UserVm);
    expect(vm.firstName).toEqual(user.firstName);
    expect(vm.lastName).toEqual(user.lastName);
    expect(vm.fullName).toEqual(user.firstName + ' ' + user.lastName);
    expect(vm).toBeInstanceOf(UserVm);
  });

  it('map with nested model', () => {
    const vm = Mapper.map(user, UserVm);
    expect(vm.nested).toBeDefined();
    expect(vm.nested.bar).toEqual(user.nested.foo);
    expect(vm.nested).toBeInstanceOf(NestedVm);
  });

  it('map with config.addProfile', () => {
    const vm = Mapper.map(address, AddressVm);
    expect(vm.addressString).toEqual(address.street + ' ' + address.city + ' ' + address.state);
    expect(vm).toBeInstanceOf(AddressVm);
  });

  it('mapArray', () => {
    const userVms = Mapper.mapArray(users, UserVm);
    const addressVms = Mapper.mapArray(addresses, AddressVm);
    const profileVms = Mapper.mapArray(profiles, ProfileVm);

    expect(userVms).toBeTruthy();
    expect(userVms).toHaveLength(1);
    userVms.forEach(vm => expect(vm).toBeInstanceOf(UserVm));

    expect(addressVms).toBeTruthy();
    expect(addressVms).toHaveLength(1);
    addressVms.forEach(vm => expect(vm).toBeInstanceOf(AddressVm));

    expect(profileVms).toBeTruthy();
    expect(profileVms).toHaveLength(1);
    profileVms.forEach(vm => expect(vm).toBeInstanceOf(ProfileVm));
  });
});
