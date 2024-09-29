import { Component } from '@angular/core';
import { LoadingModalComponent } from '../shared/components/loading-modal/loading-modal.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [LoadingModalComponent],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.scss',
})
export class TestPageComponent {
  p: number = 20;

  constructor(authService: AuthService) {
    authService.openLoginModal();
  }
}
