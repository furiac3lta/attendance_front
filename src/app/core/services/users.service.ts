import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

// ✅ Modelo de usuario que devuelve el backend
export interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  active?: boolean;
  role?: { name: string }[];
  courses?: { id: number; name: string }[];
}

// ✅ DTO para crear un nuevo usuario
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

  // 🔹 Obtener usuarios visibles según el rol
  //    - SUPER_ADMIN → todos
  //    - ADMIN → solo su organización
  findAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/visible`);
  }

  // 🔹 Crear usuario (usa /auth/register para evitar conflicto con PUT)
  create(dto: CreateUserDto): Observable<User> {
   // ✅ Ahora
return this.http.post<User>(`${environment.API_URL}/users/create`, dto);

  }

  // 🔹 Actualizar usuario
  update(id: number, data: any) {
    return this.http.put(`${this.base}/${id}`, data, { responseType: 'text' });
  }

  // 🔹 Eliminar usuario
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' });
  }

  // 🔹 Asignar cursos a un usuario
  assignCourses(userId: number, courseIds: number[]): Observable<string> {
    return this.http.post(`${this.base}/${userId}/assign-courses`, courseIds, {
      responseType: 'text', // 👈 no intenta parsear JSON
    });
  }
  findVisible(): Observable<User[]> {
  return this.http.get<User[]>(`${environment.API_URL}/users/visible`);
}
getByCourse(courseId: number) {
  return this.http.get<any[]>(`${environment.API_URL}/by-course/${courseId}`);
}


}
