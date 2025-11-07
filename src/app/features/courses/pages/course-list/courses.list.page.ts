import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CoursesService } from '../../../../core/services/courses.service';
import { Course } from '../../models/course.model';

@Component({
  selector: 'app-course-list-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-list.page.html',
  styleUrls: ['./course-list.page.css'],
})
export class CourseListPage implements OnInit {

  courses: Course[] = [];
  message = '';
  loading = true;

  constructor(
    private router: Router,
    private coursesSvc: CoursesService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.coursesSvc.findAll().subscribe({
      next: (res: Course[]) => {
        this.courses = res;
        this.loading = false;
      },
      error: () => {
        this.message = '❌ Error al obtener los cursos';
        this.loading = false;
      },
    });
  }

  canTakeAttendance(): boolean {
    const role = sessionStorage.getItem('role')?.replace('ROLE_', '') ?? '';
    return ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'].includes(role.toUpperCase());
  }

  // ✅ Va a la pantalla de clases del curso (crear/seleccionar clase)
  goToAttendance(courseId: number) {
    this.router.navigate([`/attendance/class/${courseId}`]);
  }

  goToCreateCourse(): void {
    this.router.navigate(['/courses/new']);
  }
}
