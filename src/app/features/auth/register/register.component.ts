import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, RegisterRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // 👈 IMPORTANTE: acá se importan los formularios
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['ROLE_USER'] // valor por defecto
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const request: RegisterRequest = this.registerForm.value;
      this.authService.register(request).subscribe({
        next: res => alert('✅ Usuario registrado correctamente'),
        error: err => console.error('❌ Error al registrar usuario:', err)
      });
    }
  }
}
