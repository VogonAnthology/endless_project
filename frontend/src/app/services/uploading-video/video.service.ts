import { Injectable } from '@angular/core';
export interface UploadingVideo {
  plan: string;
  videoBlob: Blob;
  title?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadedVideoService {
  private video: UploadingVideo | null = null;

  setVideo(plan: string, videoBlob: Blob, title?: string) {
    this.video = { plan, videoBlob, title };
  }

  getVideo(): UploadingVideo | null {
    return this.video;
  }

  clearVideoBlob() {
    this.video = null;
  }
}
