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
  private readonly apiUrl = `${environment.API_URL}/classes`;

  constructor(private http: HttpClient) {}

  /** Registrar asistencia de una clase */
  registerAttendance(classId: number, marks: AttendanceMark[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${classId}/attendance`, marks);
  }

getMonthlyReport(courseId: number, month: number, year: number) {
  return this.http.get<any[]>(`${environment.API_URL}/attendance/course/${courseId}/monthly`, {
    params: { month, year }
  });
}
getAttendance(classId: number) {
  return this.http.get<any[]>(`${environment.API_URL}/classes/${classId}/attendance`);
}


}
