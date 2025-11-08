import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ClassesService, ClassSessionDto } from '../../../../core/services/classes.service';
import { CoursesService } from '../../../../core/services/courses.service';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  providers: [DatePipe],
  templateUrl: './class-detail.page.html',
  styleUrls: ['./class-detail.page.css'],
})
export class ClassDetailPage implements OnInit {
  courseId!: number;
  selectedCourseName = '';
  classes: ClassSessionDto[] = [];
  message = '';
  currentDate = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classesSvc: ClassesService,
    private coursesSvc: CoursesService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.currentDate = this.datePipe.transform(
      new Date(),
      "EEEE d 'de' MMMM 'de' y, HH:mm 'hs'",
      'es-AR'
    ) ?? '';

    // ✅ LEEMOS CORRECTAMENTE EL PARAM ID
    const idParam = this.route.snapshot.paramMap.get('classId');
    this.courseId = Number(idParam);

    console.log("✅ courseId leído:", this.courseId);

    if (!this.courseId || this.courseId <= 0) {
      this.message = 'Curso inválido (ID no recibido)';
      return;
    }

    this.loadCourse(this.courseId);
    this.loadClasses(this.courseId);
  }

  loadCourse(courseId: number): void {
    this.coursesSvc.findById(courseId).subscribe({
      next: (res) => this.selectedCourseName = res?.name ?? 'Curso',
      error: (err) => console.error('❌ Error cargando curso:', err),
    });
  }

  loadClasses(courseId: number): void {
    this.classesSvc.getByCourseId(courseId).subscribe({
      next: (res) => this.classes = res ?? [],
      error: (err) => console.error('❌ Error cargando clases del curso:', err),
    });
  }

  /** ✅ Crear clase de hoy y pasar a asistencia */
  createClass(): void {
    const payload = {
      name: `Clase del ${this.datePipe.transform(new Date(), 'dd/MM/yyyy', 'es-AR')}`,
      date: new Date().toISOString().split('T')[0],
      courseId: this.courseId

 // 👈 CORRECTO
    };
  console.log("📦 Payload que se enviará:", JSON.stringify(payload, null, 2));

    console.log("📤 Payload enviado:", payload);

    this.classesSvc.createClass(payload).subscribe({
      next: (res: any) => {
        console.log("✅ Clase creada:", res);
        this.router.navigate(['/attendance/take', res.id]);
      },
      error: (err) => {
        console.error('❌ Error al crear clase:', err);
        this.message = 'Error al crear clase';
      },
    });
  }

  goToAttendance(classId: number): void {
    this.router.navigate(['/attendance/take', classId]);
  }
}
