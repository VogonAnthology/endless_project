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
import { User } from '../schemas/user.class';
import { UserService } from './user.service';
import { LoginModalComponent } from '../shared/components/login-modal/login-modal.component';
import { ServerAPIService } from './api.service';

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

  constructor(
    private serverService: ServerAPIService,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  loginPassword(username: string, password: string): Observable<boolean> {
    return this.serverService.login(username, password).pipe(
      tap((data: any) => {
        this.token = data.access_token;
        localStorage.setItem('jwtToken', this.token!);
        this.userService.setUserFromJson(data.user);
        this.isLoggedInSubject.next(true);
        this.userSubject.next(data.user);
      }),
      map(() => true),
      catchError((error) => {
        console.error('Erreur lors de la connexion:', error);
        this.token = null;
        return of(false);
      })
    );
  }

  loginGoogle(): Observable<boolean> {
    return this.serverService.loginGoogle().pipe(
      tap((data: any) => {
        this.token = data.access_token;
        localStorage.setItem('jwtToken', this.token!);
        this.userService.setUserFromJson(data.user);
        this.isLoggedInSubject.next(true);
        this.userSubject.next(data.user);
      }),
      map(() => true),
      catchError((error) => {
        console.error('Erreur lors de la connexion:', error);
        this.token = null;
        return of(false);
      })
    );
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('jwtToken');
    this.userSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  async checkTokenValidity(): Promise<void> {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const response = await this.serverService.validateToken();
      if (response.isValid) {
        this.token = token;
        localStorage.setItem('jwtToken', this.token);
        this.isLoggedInSubject.next(true);
        this.userService.setUserFromJson(response.user);
        this.userSubject.next(response.user);
        this.handleAuthentification();
      } else {
        this.token = null;
        this.isLoggedInSubject.next(false);
        this.userSubject.next(null);
        this.openLoginModal();
      }
    } else {
      this.token = null;
      this.isLoggedInSubject.next(false);
      this.userSubject.next(null);
      this.openLoginModal();
    }
  }

  openLoginModal(): void {
    const dialogRef = this.dialog.open(LoginModalComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe(() => {
      this.handleAuthentification();
    });
  }

  handleAuthentification(): void {
    if (this.isLoggedInSubscription) {
      this.isLoggedInSubscription.unsubscribe();
    }
    this.isLoggedInSubscription = this.isLoggedIn().subscribe(
      (isLoggedIn: boolean) => {
        if (!isLoggedIn) {
          this.openLoginModal();
        }
      }
    );
  }
}
