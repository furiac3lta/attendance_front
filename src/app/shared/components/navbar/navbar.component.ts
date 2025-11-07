import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

interface DecodedToken {
  sub: string;
  role?: string;
  exp?: number;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userName: string | null = null;
  userRole: string | null = null;
  private sub!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.authService.loginStatus$.subscribe((logged) => {
      this.isLoggedIn = logged;
      this.loadUserInfo();
    });

    this.loadUserInfo();
  }

  loadUserInfo(): void {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        this.userName = decoded.sub?.split('@')[0] ?? 'Usuario';
        this.userRole = role ?? 'USER';
      } catch (e) {
        console.warn('⚠️ Token inválido o no decodificable', e);
      }
    }
  }

  canSee(link: string): boolean {
    switch (this.userRole) {
      case 'SUPER_ADMIN':
        return ['dashboard', 'organizations', 'users', 'courses'].includes(link);
      case 'ADMIN':
        return ['dashboard', 'users', 'courses', 'classes', 'attendance'].includes(link);
      case 'INSTRUCTOR':
        return ['dashboard', 'classes', 'attendance'].includes(link);
      default:
        return false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
