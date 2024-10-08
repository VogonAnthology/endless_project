import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { UploadVideoPageComponent } from './contribute-pages/upload-video-page/upload-video-page.component';
import { FinishUploadConfirmationPageComponent } from './contribute-pages/finish-upload-confirmation-page/finish-upload-confirmation-page.component';
import { TestPageComponent } from './test-page/test-page.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';

export const routes: Routes = [
  { path: 'welcome-page', component: WelcomePageComponent },
  {
    path: 'home-page',
    component: HomePageComponent,
    data: { animation: 'HomePage' },
  },
  {
    path: 'upload-video-page',
    component: UploadVideoPageComponent,
    data: { animation: 'UploadVideoPage' },
  },
  {
    path: 'finish-upload-confirmation-page',
    component: FinishUploadConfirmationPageComponent,
  },
  { path: 'test', component: TestPageComponent },
  { path: '', redirectTo: '/home-page', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
