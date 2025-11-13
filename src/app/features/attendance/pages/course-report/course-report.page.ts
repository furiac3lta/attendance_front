import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CoursesService } from '../../../../core/services/courses.service';

// SweetAlert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './course-report.page.html',
  styleUrls: ['./course-report.page.css'],
})
export class CourseReportPage implements OnInit {

  displayedColumns = ['studentName', 'present', 'absent', 'total', 'percent'];

  courseId!: number;
  month!: number;
  year!: number;
  courseName = '';

  stats: any[] = [];

  months = [
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 },
  ];

  years: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private attendanceSvc: AttendanceService,
    private courseSvc: CoursesService
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));

    const today = new Date();
    this.month = today.getMonth() + 1;
    this.year = today.getFullYear();

    const currentYear = today.getFullYear();
    this.years = Array.from({ length: 6 }, (_, i) => currentYear - i);

    this.loadCourseInfo();
    this.loadReport();
  }

  /** 🔹 Carga el nombre del curso */
  loadCourseInfo() {
    this.courseSvc.getById(this.courseId).subscribe({
      next: (course: any) => this.courseName = course.name,
      error: () => {
        this.courseName = 'Curso desconocido';
        Swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'No se pudo cargar el nombre del curso.',
          heightAuto: false
        });
      }
    });
  }

  /** 🔹 Carga el reporte mensual */
  loadReport() {
    this.attendanceSvc.getMonthlyReport(this.courseId, this.month, this.year).subscribe({
      next: res => {
        this.stats = res.map((s: any) => ({
          studentName: s.studentName,
          present: s.present ?? 0,
          total: s.totalClasses ?? s.total ?? 0,
          absent: (s.totalClasses ?? s.total ?? 0) - (s.present ?? 0),
          percent: s.percent ?? 0
        }));
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el reporte mensual.',
          heightAuto: false
        });
      }
    });
  }

  /** 🔹 Devuelve el nombre del mes */
  getMonthLabel(value: number): string {
    const found = this.months.find(m => m.value === value);
    return found ? found.label : '';
  }

  /** 🔹 Color según porcentaje */
  getColor(percent: number): string {
    if (percent >= 85) return 'limegreen';
    if (percent >= 60) return 'orange';
    return 'red';
  }
}
