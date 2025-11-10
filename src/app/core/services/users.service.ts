import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

// ✅ Modelo de usuario que devuelve el backend
export interface User {
  id: number;
  fullName?: string;
  email?: string;
  role?: string;
  courses?: string[]; // ← ahora cursos son nombres, no objetos
  // ✅ Ahora sí coincide con el JSON del backend
  organizationId?: number | null;
  organizationName?: string | null;

  
}

// ✅ DTO para crear usuario
export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  role: string;
  organization?: { id: number }; // ✅ lo sumamos también
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private base = `${environment.API_URL}/users`;

  constructor(private http: HttpClient) {}

  // ✅ Añadir token automáticamente
  private authHeaders() {
    const token = sessionStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // 🔹 Obtener usuarios
  findAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}`, this.authHeaders());
  }

  create(dto: any): Observable<User> {
  return this.http.post<User>(`${this.base}/create`, dto, this.authHeaders());
}

update(id: number, data: any) {
  return this.http.put(`${this.base}/${id}`, data, this.authHeaders());
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

  // 🔹 Obtener alumnos de un curso
  getByCourse(courseId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/by-course/${courseId}`, this.authHeaders());
  }

  // 🔹 Listar instructores
  getInstructors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/role/INSTRUCTOR`, this.authHeaders());
  }

  // ✅ Obtener organizaciones
  getOrganizations(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.API_URL}/organizations`, this.authHeaders());
  }
  
}
