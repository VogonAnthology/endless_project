import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginModalComponent {
  email: string = '';
  password: string = '';

  onSubmit() {
    // Handle email/password login
    console.log('Email:', this.email, 'Password:', this.password);
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:3000/auth/google';
  }

  loginWithApple() {
    // Implement Apple login here
    console.log('Login with Apple');
  }
}
