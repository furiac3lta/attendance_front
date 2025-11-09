import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../../core/services/attendance.service';

@Component({
  selector: 'app-attendance-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-view.page.html',
  styleUrls: ['./attendance-view.page.css']
})
export class AttendanceViewPage implements OnInit {

  classId!: number;
  records: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private attendanceSvc: AttendanceService,
    private router: Router
  ) {}

 ngOnInit(): void {
  this.classId = Number(this.route.snapshot.paramMap.get('classId'));

  this.attendanceSvc.getAttendance(this.classId).subscribe({
    next: (res: any[]) => {
      console.log("📦 Respuesta de backend:", res);

      this.records = res.map(item => ({
        fullName: item.studentName,
        present: item.attended
      }));
    },
    error: () => alert("⚠️ No se pudo cargar la asistencia")
  });
}


  load() {
  this.attendanceSvc.getAttendance(this.classId).subscribe({
  next: (res) => {
    console.log("📦 Respuesta de backend:", res);
  },
  error: () => alert("⚠️ No se pudo cargar la asistencia")
});


  }
goBack() {
  window.history.back();
}

}
