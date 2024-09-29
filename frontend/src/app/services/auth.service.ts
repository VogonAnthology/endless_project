import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginModalComponent } from '../shared/components/login-modal/login-modal.component';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private dialog: MatDialog) {}

  openLoginModal() {
    this.dialog.open(LoginModalComponent);
  }
}
