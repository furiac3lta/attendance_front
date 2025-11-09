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
  courseId!: number;
  className = '';
  courseName = '';
  date = '';

  students: StudentDto[] = [];
  attendanceMarks: AttendanceMark[] = [];
  wasAlreadyTaken = false;

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
      this.router.navigate(['/dashboard']);
      return;
    }

    // Detalles de clase → nos da courseId para volver
    this.classesSvc.getDetails(this.classId).subscribe({
      next: (res) => {
        this.className = res?.name ?? '';
        this.date = res?.date ?? '';
        this.courseName = res?.courseName ?? '';
        this.courseId = Number(res?.courseId);
      },
      error: () => alert('⚠️ No se pudo cargar la clase')
    });

    // Alumnos
    this.classesSvc.getStudentsForClass(this.classId).subscribe({
      next: (list) => {
        this.students = list ?? [];
        // Intentar cargar asistencia previa (si existe → editar)
        this.attendanceSvc.getSessionAttendance(this.classId).subscribe({
          next: (marks) => {
            if (marks && marks.length > 0) {
              this.wasAlreadyTaken = true;
              this.attendanceMarks = marks;
            } else {
              // inicial por defecto (todos ausentes)
              this.attendanceMarks = this.students.map(s => ({ userId: s.id, present: false }));
            }
          },
          error: () => {
            this.attendanceMarks = this.students.map(s => ({ userId: s.id, present: false }));
          }
        });
      },
      error: () => alert('⚠️ No se pudieron cargar los alumnos'),
    });
  }

  getMark(userId: number): boolean {
    return this.attendanceMarks.find(a => a.userId === userId)?.present ?? false;
  }

  toggleAttendance(userId: number, present: boolean) {
    const mark = this.attendanceMarks.find(a => a.userId === userId);
    if (mark) mark.present = present;
    else this.attendanceMarks.push({ userId, present });
  }

  /** ✅ Guarda y vuelve al listado del curso correcto */
  save() {
    this.attendanceSvc.registerAttendance(this.classId, this.attendanceMarks).subscribe({
      next: () => {
        alert(this.wasAlreadyTaken ? '✅ Cambios guardados' : '✅ Asistencia registrada');
        this.router.navigate(['/attendance/class', this.courseId]); // vuelve al listado de clases del curso
      },
      error: () => alert('❌ No se pudo guardar la asistencia'),
    });
  }
}
