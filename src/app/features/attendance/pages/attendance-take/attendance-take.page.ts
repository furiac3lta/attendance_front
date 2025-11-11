import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AttendanceService, AttendanceMark } from '../../../../core/services/attendance.service';
import { ClassesService, StudentDto } from '../../../../core/services/classes.service';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-attendance-take',
  standalone: true,
  imports: [CommonModule, FormsModule,  MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule],
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
      this.router.navigate(['/courses']);
      return;
    }

    // ✅ Usamos getClassDetails (el nuevo endpoint con courseId incluido)
    this.classesSvc.getClassDetails(this.classId).subscribe({
      next: (res) => {
        console.log("📦 Detalles clase:", res);

        this.className = res.className;
        this.date = res.date;
        this.courseName = res.courseName;
        this.courseId = res.courseId; // ✅ AHORA VIENE DEL BACKEND

        if (!this.courseId) {
          console.error("❌ ERROR: courseId NO vino del backend. Revisar DTO.");
        }
      },
      error: () => alert('⚠️ No se pudo cargar detalles de la clase')
    });

    // ✅ Cargar alumnos
    this.classesSvc.getStudentsForClass(this.classId).subscribe(students => {
      this.students = students ?? [];

      // ✅ Ver si ya tenía asistencia
      this.attendanceSvc.getSessionAttendance(this.classId).subscribe(marks => {
        if (marks?.length > 0) {
          this.wasAlreadyTaken = true;
          this.attendanceMarks = marks;
        } else {
          this.attendanceMarks = this.students.map(s => ({
            userId: s.id,
            present: false
          }));
        }
      });
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
        this.router.navigate(['/attendance/class', this.courseId]); // ✅ YA NO ES NaN
      },
      error: () => alert('❌ No se pudo guardar la asistencia')
    });
  }


}
