import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassesService, ClassSessionDto } from '../../../../core/services/classes.service';
import { CoursesService } from '../../../../core/services/courses.service';
import { AttendanceService } from '../../../../core/services/attendance.service';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './class-detail.page.html',
  styleUrls: ['./class-detail.page.css'],
})
export class ClassDetailPage implements OnInit {
  courseId!: number;
  selectedCourseName = '';
  classes: (ClassSessionDto & { attendanceTaken?: boolean })[] = [];
  message = '';
  currentDate = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classesSvc: ClassesService,
    private coursesSvc: CoursesService,
    private attendanceSvc: AttendanceService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.currentDate = this.datePipe.transform(new Date(),
      "EEEE d 'de' MMMM 'de' y, HH:mm 'hs'", 'es-AR') ?? '';

    // 🧭 esta ruta debe ser /attendance/class/:courseId
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    if (!this.courseId) {
      this.message = 'Curso inválido';
      return;
    }

    this.loadCourse(this.courseId);
    this.loadClasses(this.courseId);
  }

  loadCourse(courseId: number) {
    this.coursesSvc.findById(courseId).subscribe({
      next: res => this.selectedCourseName = res?.name ?? 'Curso',
      error: err => console.error('❌ Error cargando curso:', err),
    });
  }

  loadClasses(courseId: number) {
    this.classesSvc.getByCourseId(courseId).subscribe({
      next: res => {
        const list = (res ?? []) as (ClassSessionDto & { attendanceTaken?: boolean })[];
        this.classes = list;

        // Para cada clase, verificar si ya tiene asistencia
        this.classes.forEach(c => {
          this.attendanceSvc.getSessionAttendance(c.id).subscribe(marks => {
            c.attendanceTaken = (marks?.length ?? 0) > 0;
          });
        });
      },
      error: err => console.error('❌ Error cargando clases del curso:', err),
    });
  }

  createClass() {
    const payload = {
      name: `Clase del ${this.datePipe.transform(new Date(), 'dd/MM/yyyy', 'es-AR')}`,
      date: new Date().toISOString().split('T')[0],
      courseId: this.courseId
    };

    this.classesSvc.createClass(payload).subscribe({
      next: res => this.router.navigate(['/attendance/take', res.id]),
      error: err => {
        console.error('❌ Error al crear clase:', err);
        this.message = 'Error al crear clase';
      },
    });
  }

  goToAttendance(classId: number) { this.router.navigate(['/attendance/take', classId]); }
  viewAttendance(classId: number) { this.router.navigate(['/attendance/view', classId]); }
  goToReport() { this.router.navigate(['/attendance/report', this.courseId]); }
}
