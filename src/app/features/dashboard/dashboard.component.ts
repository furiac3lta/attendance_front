import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  role: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.role = sessionStorage.getItem('role');

    if (!this.role) {
      this.router.navigate(['/login']);
      return;
    }
  }

  goToSection(path: string): void {
    this.router.navigate([path]);
  }
}
