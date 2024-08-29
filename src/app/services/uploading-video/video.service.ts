import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private videoBlob: Blob | null = null;

  setVideoBlob(blob: Blob) {
    this.videoBlob = blob;
  }

  getVideoBlob(): Blob | null {
    return this.videoBlob;
  }

  clearVideoBlob() {
    this.videoBlob = null;
  }
}
