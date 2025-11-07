import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  token: string;
  type: string; // ADMIN, INSTRUCTOR, SUPER_ADMIN, etc.
  user?: any;   // 👈 nuevo: el backend ahora devuelve el usuario completo
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.API_URL}/auth`;
  private loginStatus = new BehaviorSubject<boolean>(this.hasToken());
  loginStatus$ = this.loginStatus.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  // ======================================================
  // 🔹 LOGIN con redirección automática por rol
  // ======================================================
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, payload).pipe(
      tap({
        next: (res) => {
          if (res && res.token) {
            // ✅ Guardamos el token y rol
            localStorage.setItem('token', res.token);
            localStorage.setItem('role', res.type);

            // ✅ Guardamos también el usuario completo si viene
            if (res.user) {
              localStorage.setItem('user', JSON.stringify(res.user));
              console.log('✅ Usuario guardado en localStorage:', res.user);
            } else {
              console.warn('⚠️ No se recibió el usuario en la respuesta del backend:', res);
            }

            this.loginStatus.next(true);
            console.log('✅ Token guardado correctamente en localStorage:', res.token);

            // 🔹 Normalizamos el rol (por si el backend lo envía con ROLE_)
            const role = res.type?.replace(/^ROLE_/, '').toUpperCase();

            // 🔁 Redirección automática según rol
            switch (role) {
              case 'SUPER_ADMIN':
                this.router.navigate(['/organizations']);
                break;

              case 'ADMIN':
                this.router.navigate(['/users']);
                break;

              case 'INSTRUCTOR':
                this.router.navigate(['/attendance']);
                break;

              case 'USER':
                this.router.navigate(['/courses']);
                break;

              default:
                alert('⚠️ Rol no reconocido. Contactá al administrador.');
                this.logout();
                break;
            }
          } else {
            console.warn('⚠️ No se recibió token en la respuesta:', res);
          }
        },
        error: (err) => {
          if (err.status === 403) {
            alert('⛔ Acceso denegado: tu cuenta no tiene permisos para ingresar.');
          } else if (err.status === 401) {
            alert('⚠️ Credenciales incorrectas.');
          } else {
            alert('❌ Error de conexión o servidor. Intenta nuevamente.');
          }
          console.error('❌ Error de login:', err);
        },
      })
    );
  }

  // ======================================================
  // 🔹 REGISTRO
  // ======================================================
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, payload);
  }

  // ======================================================
  // 🔹 LOGOUT
  // ======================================================
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.loginStatus.next(false);
    this.router.navigate(['/login']);
    console.log('🚪 Sesión cerrada correctamente.');
  }

  // ======================================================
  // 🔹 TOKEN
  // ======================================================
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ======================================================
  // 🔹 LOGIN CHECK
  // ======================================================
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // ======================================================
  // 🔹 ROLE NORMALIZADO
  // ======================================================
  getRole(): string {
    const role = localStorage.getItem('role');
    return role ? role.replace(/^ROLE_/, '').toUpperCase() : '';
  }

  // ======================================================
  // 🔹 OBTENER USUARIO GUARDADO
  // ======================================================
  getUser(): any | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }
}
