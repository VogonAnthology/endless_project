import {
  Subscription,
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  tap,
} from 'rxjs';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { User } from '../models/user.class';
import { UserService } from './user.service';
import { HttpService } from './http.service';
import { LoginModalComponent } from '../shared/components/login-modal/login-modal.component';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string | null = null;
  private isLoggedInSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  private userSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  private isLoggedInSubscription: Subscription | null = null;
  private statusChecked: boolean = false;

  constructor(
    private httpService: HttpService,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  getToken(): string | null {
    return this.token;
  }

  getStatusChecked(): boolean {
    return this.statusChecked;
  }

  getCurrentUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  // loginPassword(username: string, password: string): Observable<boolean> {
  //   return this.httpService.login(username, password).pipe(
  //     tap((data: any) => {
  //       this.token = data.access_token;
  //       localStorage.setItem('jwtToken', this.token!);
  //       this.userService.setUserFromJson(data.user);
  //       this.isLoggedInSubject.next(true);
  //       this.userSubject.next(data.user);
  //     }),
  //     map(() => true),
  //     catchError((error) => {
  //       console.error('Erreur lors de la connexion:', error);
  //       this.token = null;
  //       return of(false);
  //     })
  //   );
  // }

  async checkStatus(): Promise<void> {
    if (this.statusChecked) {
      return;
    }
    try {
      const user = await this.httpService.checkUserStatus();
      console.log('user:', user);
      if (user) {
        this.userService.setUserFromJson(user);
        this.isLoggedInSubject.next(true);
        this.userSubject.next(user);
      } else {
        this.isLoggedInSubject.next(false);
        this.userSubject.next(null);
      }
    } catch (error) {
      console.error('Error while checking user status:', error);
    } finally {
      this.statusChecked = true;
    }
  }

  loginGoogle(): Observable<boolean> {
    return this.httpService.loginGoogle();
  }

  async logout(): Promise<void> {
    await this.httpService.logout();
    this.userSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  // async checkTokenValidity(): Promise<void> {
  //   const token = localStorage.getItem('jwtToken');
  //   if (token) {
  //     const response = await this.httpService.validateToken();
  //     if (response.isValid) {
  //       this.token = token;
  //       localStorage.setItem('jwtToken', this.token);
  //       this.isLoggedInSubject.next(true);
  //       this.userService.setUserFromJson(response.user);
  //       this.userSubject.next(response.user);
  //       this.handleAuthentification();
  //     } else {
  //       this.token = null;
  //       this.isLoggedInSubject.next(false);
  //       this.userSubject.next(null);
  //       this.openLoginModal();
  //     }
  //   } else {
  //     this.token = null;
  //     this.isLoggedInSubject.next(false);
  //     this.userSubject.next(null);
  //     this.openLoginModal();
  //   }
  // }

  openLoginModal(): void {
    const dialogRef = this.dialog.open(LoginModalComponent, {
      data: {},
    });

    // dialogRef.afterClosed().subscribe(() => {
    //   this.handleAuthentification();
    // });
  }

  //   handleAuthentification(): void {
  //     if (this.isLoggedInSubscription) {
  //       this.isLoggedInSubscription.unsubscribe();
  //     }
  //     this.isLoggedInSubscription = this.isLoggedIn().subscribe(
  //       (isLoggedIn: boolean) => {
  //         if (!isLoggedIn) {
  //           this.openLoginModal();
  //         }
  //       }
  //     );
  //   }
  // }
}
