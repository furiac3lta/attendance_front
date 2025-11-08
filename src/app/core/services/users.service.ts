import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

// ✅ Modelo de usuario que devuelve el backend
export interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  active?: boolean;
  role?: string; // corregido: el backend devuelve un string, no array
  courses?: { id: number; name: string }[];
}

// ✅ DTO para crear usuario
export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private base = `${environment.API_URL}/users`;

  constructor(private http: HttpClient) {}

  // ✅ Añadimos token automáticamente
  private authHeaders() {
    const token = sessionStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // 🔹 Obtener usuarios visibles
  findAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}`, this.authHeaders());
  }

  // 🔹 Crear usuario
  create(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.base}/create`, dto, this.authHeaders());
  }

  // 🔹 Actualizar usuario
  update(id: number, data: any) {
    return this.http.put(`${this.base}/${id}`, data, { ...this.authHeaders(), responseType: 'text' });
  }

  // 🔹 Eliminar usuario
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`, { ...this.authHeaders(), responseType: 'text' });
  }

  // 🔹 Asignar cursos
  assignCourses(userId: number, courseIds: number[]): Observable<string> {
    return this.http.post(`${this.base}/${userId}/assign-courses`, courseIds, { ...this.authHeaders(), responseType: 'text' });
  }

  // 🔹 Listar visibles según el rol del usuario logueado
  findVisible(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/visible`, this.authHeaders());
  }

  // 🔹 Obtener usuarios inscritos en un curso
  getByCourse(courseId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/by-course/${courseId}`, this.authHeaders());
  }

  // 🔹 Listar instructores correctamente
  getInstructors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/role/INSTRUCTOR`, this.authHeaders());
  }
}
