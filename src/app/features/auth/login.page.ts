import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      alert('⚠️ Completá todos los campos correctamente.');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        console.log('✅ Login exitoso:', res);

        // 🔐 Guardamos token y rol
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('role', res.type);

        const role = res.type?.replace(/^ROLE_/, '').toUpperCase();
        alert(`Bienvenido ${role.replace('_', ' ')}`);

        // 🚀 Redirige siempre al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('❌ Error de login:', err);

        if (err.status === 401) {
          alert('⚠️ Usuario o contraseña incorrectos.');
        } else if (err.status === 403) {
          alert('⛔ Tu cuenta no tiene permisos para ingresar.');
        } else {
          alert('❌ Error de conexión con el servidor.');
        }
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
