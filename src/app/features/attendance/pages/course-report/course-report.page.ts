import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Necesario para [(ngModel)]
import { AttendanceService } from '../../../../core/services/attendance.service';

@Component({
  selector: 'app-course-report',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Agregado
  templateUrl: './course-report.page.html',
  styleUrls: ['./course-report.page.css'],
})
export class CourseReportPage implements OnInit {

  courseId!: number;
  month!: number;
  year!: number;

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
    private attendanceSvc: AttendanceService
  ) {}

 ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    const today = new Date();
    this.month = today.getMonth() + 1;
    this.year = today.getFullYear();
    this.loadReport();
  }

 loadReport() {
this.attendanceSvc.getMonthlyReport(this.courseId, this.month, this.year).subscribe({
      next: res => this.stats = res,
      error: () => alert("⚠️ No se pudo cargar el reporte")
    });
  }

  getColor(percent: number): string {
    if (percent >= 85) return 'green';
    if (percent >= 60) return 'orange';
    return 'red';
  }
}
