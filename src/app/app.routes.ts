import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { UploadVideoPageComponent } from './contribute-pages/upload-video-page/upload-video-page.component';

export const routes: Routes = [
  { path: 'home-page', component: HomePageComponent },
  { path: 'upload-video-page', component: UploadVideoPageComponent },
  { path: '', redirectTo: '/home-page', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
