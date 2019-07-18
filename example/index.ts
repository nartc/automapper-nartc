import { Mapper } from 'automapper-nartc';

class User {
  firstName: string;
  lastName: string;

  constructor() {
    this.firstName = '';
    this.lastName = '';
  }
}

class UserVm {
  constructor(
    public firstName: string,
    public lastName: string,
    public fullName: string
  ) {
  }
}

Mapper.initialize(cfg => {
  cfg.createMap(User, UserVm)
    .reverseMap();
});

const user = new User();
user.firstName = 'Chau';
user.lastName = 'Tran';

const userVm = Mapper.map(user, UserVm);

console.log(userVm);

const anotherUser = Mapper.map(userVm, User);
console.log(anotherUser);
