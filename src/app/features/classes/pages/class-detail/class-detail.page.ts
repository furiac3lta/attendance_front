import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

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
  classes: ClassSessionDto[] = [];
  message = '';
  currentDate = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classesSvc: ClassesService,
    private coursesSvc: CoursesService,
    private datePipe: DatePipe,
    private attendanceSvc: AttendanceService
  ) {}

  ngOnInit(): void {
    this.currentDate = this.datePipe.transform(
      new Date(),
      "EEEE d 'de' MMMM 'de' y, HH:mm 'hs'",
      'es-AR'
    ) ?? '';

    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));

    if (!this.courseId) {
      this.message = 'Curso inválido';
      return;
    }

    this.loadCourse(this.courseId);
    this.loadClasses(this.courseId);
  }

  loadCourse(courseId: number): void {
    this.coursesSvc.findById(courseId).subscribe(res => {
      this.selectedCourseName = res?.name ?? 'Curso';
    });
  }

  loadClasses(courseId: number): void {
    this.classesSvc.getByCourseId(courseId).subscribe(res => {
      this.classes = res ?? [];

      this.classes.forEach(c => {
       this.attendanceSvc.getByClassId(c.id).subscribe(att => {
  c.attendanceTaken = att.length > 0;
});

      });
    });
  }

  createClass(): void {
    const payload = {
      name: `Clase del ${this.datePipe.transform(new Date(), 'dd/MM/yyyy', 'es-AR')}`,
      date: new Date().toISOString().split('T')[0],
      courseId: this.courseId
    };

    this.classesSvc.createClass(payload).subscribe(res => {
      this.router.navigate(['/attendance/take', res.id]);
    });
  }

  goToAttendance(classId: number): void {
    this.router.navigate(['/attendance/take', classId]);
  }

  viewAttendance(classId: number): void {
    this.router.navigate(['/attendance/view', classId]);
  }

  goToReport(): void {
    this.router.navigate(['/attendance/report', this.courseId]);
  }
}
