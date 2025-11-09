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

    this.classesSvc.getDetails(this.classId).subscribe(res => {
      this.courseId = res.courseId; // ✅ Necesario para volver correctamente
    });

    this.classesSvc.getStudentsForClass(this.classId).subscribe(res => {
      this.students = res ?? [];

   this.attendanceSvc.getSessionAttendance(this.classId).subscribe({
  next: (attendanceRes: any[]) => {

    if (attendanceRes && attendanceRes.length > 0) {
      this.wasAlreadyTaken = true;
      this.attendanceMarks = attendanceRes.map(a => ({
        userId: a.userId,       // ✅ Ahora coincide
        present: a.present     // ✅ Ahora coincide
      }));
    } else {
      this.attendanceMarks = this.students.map(s => ({
        userId: s.id,
        present: false
      }));
    }
  },
  error: () => {
    this.attendanceMarks = this.students.map(s => ({
      userId: s.id,
      present: false
    }));
  }
});

    });
  }

  toggleAttendance(userId: number, present: boolean) {
    const item = this.attendanceMarks.find(a => a.userId === userId);
    if (item) item.present = present;
  }

  getMark(userId: number): boolean {
    return this.attendanceMarks.find(a => a.userId === userId)?.present ?? false;
  }

  save() {
    this.attendanceSvc.registerAttendance(this.classId, this.attendanceMarks).subscribe(() => {
      alert(this.wasAlreadyTaken ? '✅ Cambios guardados' : '✅ Asistencia registrada');
      this.router.navigate(['/attendance/class', this.courseId]); // ✅ vuelve al curso correcto
    });
  }
}
