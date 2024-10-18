import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user: User | null = null;
  private userSubject = new Subject<User | null>();

  public setUserFromJson(user: any): void {
    console.log(user);
    this.user = User.fromJson(user);
    localStorage.setItem('user', user);
    this.userSubject.next(this.user);
  }

  public getUser(): User | null {
    if (this.user == null) {
      this.user = this.getUserFromLocalStorage();
    }
    return this.user;
  }

  public getUserFromLocalStorage(): User | null {
    const user = localStorage.getItem('user');
    if (user == null) {
      return null;
    }
    return User.fromJson(user);
  }

  public getUserUpdates(): Observable<User | null> {
    return this.userSubject.asObservable();
  }
}
