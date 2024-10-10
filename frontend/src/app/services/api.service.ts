import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServerAPIService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getUser(): Promise<any> {
    const headers = this.getHeaders();
    console.log(headers);
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${this.apiUrl}/auth/getUser`, { headers }).subscribe({
        next: (data) => {
          console.log(data);
          resolve(data); // Resolve the promise with the received data
        },
        error: (error) => {
          console.error(error);
          reject(error); // Reject the promise with the error
        },
        complete: () => {
          console.log('Request completed');
        },
      });
    });
  }

  validateToken(): Promise<any> {
    const headers = this.getHeaders();
    console.log(headers);
    return new Promise((resolve, reject) => {
      this.http
        .get<any>(`${this.apiUrl}/auth/validateToken`, { headers })
        .subscribe({
          next: (data) => {
            console.log(data);
            resolve(data); // Resolve the promise with the received data
          },
          error: (error) => {
            console.error(error);
            reject(error); // Reject the promise with the error
          },
          complete: () => {
            console.log('Request completed');
          },
        });
    });
  }

  // Inscription
  registerUser(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, {
      username: username,
      password: password,
    });
  }

  // Connexion
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, {
      username: username,
      password: password,
    });
  }

  loginGoogle(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/google`);
  }
}
