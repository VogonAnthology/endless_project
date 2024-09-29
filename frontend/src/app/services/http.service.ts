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
    const formData = new FormData();
    formData.append('plan', plan);
    formData.append('video', videoBlob);

    // Make the HTTP POST request
    return this.http.post(this.apiUrl + '/video/upload', formData).pipe(
      catchError((error) => {
        console.error('Failed to upload video:', error);
        return throwError(
          () => new Error('Failed to upload video, please try again later')
        );
      })
    );
  }

  postRawVideo(formData: FormData): Observable<HttpEvent<any>> {
    return this.http.post(`${this.apiUrl}/video/trim-convert`, formData, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    });
  }
}
