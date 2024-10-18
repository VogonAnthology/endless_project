import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private apiUrl = 'http://localhost:3000'; // Base URL for video upload API

  constructor(private http: HttpClient) {}

  // Method to upload video using HttpClient
  postVideo(plan: string, videoBlob: Blob): Observable<any> {
    // const formData = new FormData();
    // formData.append('plan', plan);
    // formData.append('video', videoBlob);

    // Make the HTTP POST request
    return this.http
      .post(this.apiUrl + '/contesting-video/upload', {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          console.error('Failed to upload video:', error);
          return throwError(
            () => new Error('Failed to upload video, please try again later')
          );
        })
      );
  }

  voteForVideo(videoId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .post<any>(
          `${this.apiUrl}/contesting-video/vote`,
          { videoId: videoId },
          {
            withCredentials: true,
          }
        )
        .subscribe({
          next: (data) => {
            resolve(data); // Resolve the promise with the received data
          },
          error: (error) => {
            reject(error); // Reject the promise with the error
          },
          complete: () => {
            console.log('Request completed');
          },
        });
    });
  }

  getContestVideos(contestId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get<any>(`${this.apiUrl}/contests?id=${contestId}`, {
          withCredentials: true,
        })
        .subscribe({
          next: (data) => {
            resolve(data); // Resolve the promise with the received data
          },
          error: (error) => {
            reject(error); // Reject the promise with the error
          },
          complete: () => {},
        });
    });
  }

  checkUserStatus(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get<any>(`${this.apiUrl}/auth/status`, {
          withCredentials: true,
        })
        .subscribe({
          next: (data) => {
            resolve(data); // Resolve the promise with the received data
          },
          error: (error) => {
            reject(error); // Reject the promise with the error
          },
          complete: () => {},
        });
    });
  }

  logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get<any>(`${this.apiUrl}/auth/signout`, {
          withCredentials: true,
        })
        .subscribe({
          next: (data) => {
            resolve(data); // Resolve the promise with the received data
          },
          error: (error) => {
            reject(error); // Reject the promise with the error
          },
          complete: () => {
            console.log('Request completed');
          },
        });
    });
  }

  postRawVideo(formData: FormData): Observable<HttpEvent<any>> {
    return this.http.post(
      `${this.apiUrl}/contesting-video/trim-convert`,
      formData,
      {
        withCredentials: true,
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }

  refreshToken() {
    return this.http
      .get('http://localhost:3000/auth/refresh', { withCredentials: true })
      .subscribe((response: any) => {
        const accessToken = response.accessToken;
        console.log(accessToken);
        localStorage.setItem('accessToken', accessToken);
      });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
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
