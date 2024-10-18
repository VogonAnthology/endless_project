export class User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  picture?: string;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.picture = user.picture;
  }

  static fromJson(user: any): User {
    return new User({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
    });
  }
}
