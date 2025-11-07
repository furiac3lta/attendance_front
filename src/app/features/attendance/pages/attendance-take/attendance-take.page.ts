import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AttendanceService, AttendanceMark } from '../../../../core/services/attendance.service';
import { ClassesService, StudentDto } from '../../../../core/services/classes.service';

@Component({
  selector: 'app-attendance-take',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-take.page.html',
  styleUrls: ['./attendance-take.page.css'],
})
export class AttendanceTakePage implements OnInit {
  classId!: number;
  courseName = '';
  className = '';
  date = '';
  students: StudentDto[] = [];

  // Estructura correcta para el POST
  attendanceMarks: AttendanceMark[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classesSvc: ClassesService,
    private attendanceSvc: AttendanceService
  ) {}

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('classId'));

    if (!this.classId || Number.isNaN(this.classId)) {
      alert('Clase inválida');
      this.router.navigate(['/']);
      return;
    }

    // Detalles (curso/clase)
    this.classesSvc.getDetails(this.classId).subscribe({
      next: (res) => {
        this.className = res?.name ?? '';
        this.date = res?.date ?? '';
        this.courseName = res?.courseName ?? '';
      },
      error: () => alert('⚠️ No se pudo cargar la clase'),
    });

    // Alumnos
    this.classesSvc.getStudentsForClass(this.classId).subscribe({
      next: (res) => {
        this.students = res ?? [];
        // inicializamos marcas (por defecto ausente = false)
        this.attendanceMarks = this.students.map(s => ({ userId: s.id, present: false }));
      },
      error: () => alert('⚠️ No se pudieron cargar los alumnos'),
    });
  }

  toggleAttendance(userId: number, present: boolean) {
    const idx = this.attendanceMarks.findIndex(a => a.userId === userId);
    if (idx >= 0) {
      this.attendanceMarks[idx].present = present;
    } else {
      this.attendanceMarks.push({ userId, present });
    }
  }

  save() {
    this.attendanceSvc.registerAttendance(this.classId, this.attendanceMarks).subscribe({
      next: () => {
        alert('✅ Asistencia guardada');
        this.router.navigate(['/attendance/class', /* volver al curso */]);
      },
      error: () => alert('❌ No se pudo guardar la asistencia'),
    });
  }
getMark(userId: number): boolean {
  const mark = this.attendanceMarks.find(a => a.userId === userId);
  return mark ? mark.present : false;
}


}
