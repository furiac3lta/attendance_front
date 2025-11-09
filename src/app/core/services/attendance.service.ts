import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface AttendanceMark {
  userId: number;
  present: boolean;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {

  private readonly apiUrl = `${environment.API_URL}/attendance`; // ✅ AHORA APUNTA A /attendance

  constructor(private http: HttpClient) {}

  /** ✅ Obtener asistencia existente de una clase */
  getSessionAttendance(classId: number): Observable<AttendanceMark[]> {
    return this.http.get<AttendanceMark[]>(`${this.apiUrl}/class/${classId}`);
  }

  /** ✅ Guardar o editar asistencia de la clase */
  registerAttendance(classId: number, marks: AttendanceMark[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${classId}/attendance`, marks);
  }

  /** ✅ Nuevo método estándar */
  getByClassId(classId: number): Observable<AttendanceMark[]> {
    return this.http.get<AttendanceMark[]>(`${this.apiUrl}/class/${classId}`);
  }

  /** ✅ Reporte mensual */
  getMonthlyReport(courseId: number, month: number, year: number) {
    return this.http.get<any[]>(`${this.apiUrl}/course/${courseId}/monthly`, {
      params: { month, year }
    });
  }
  getAttendance(classId: number) {
  return this.http.get<any[]>(`${this.apiUrl}/class/${classId}`);
}

}
