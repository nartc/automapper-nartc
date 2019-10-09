import { Expose } from 'class-transformer';
import { AutoMapper, Mapper, MappingProfileBase } from '../src';

class User {
  @Expose()
  firstName!: string;
  @Expose()
  lastName!: string;
}

class UserVm {
  @Expose()
  firstName!: string;
  @Expose()
  lastName!: string;
  @Expose()
  fullName!: string;
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

class AddressProfile extends MappingProfileBase {
  constructor() {
    super();
  }

  configure(): void {
    this.createMap(Address, AddressVm).forMember('addressString', opts =>
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
        .createMap(User, UserVm)
        .forMember('fullName', opts => opts.mapFrom(s => s.firstName + ' ' + s.lastName));
      cfg.addProfile(new AddressProfile());
    });

    user = new User();
    user.firstName = 'Chau';
    user.lastName = 'Tran';

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
