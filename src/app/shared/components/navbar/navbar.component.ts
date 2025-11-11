import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface DecodedToken {
  sub: string;
  exp?: number;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive,MatToolbarModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userName: string | null = null;
  userRole: string | null = null;

  private subRole!: Subscription;
  private subLogin!: Subscription;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // ✅ Se actualiza cuando cambia el login
    this.subLogin = this.auth.loginStatus$.subscribe(logged => {
      this.isLoggedIn = logged;
      this.loadUserInfo();
    });

    // ✅ Se actualiza cuando cambia el rol (login o logout)
    this.subRole = this.auth.role$.subscribe(role => {
      this.userRole = role;
      this.loadUserInfo();
    });

    this.loadUserInfo();
  }

  loadUserInfo(): void {
    this.userRole = this.auth.getRole() || null;
    const user = this.auth.getUser();

    if (user?.fullName) {
      this.userName = user.fullName.split(' ')[0]; // solo nombre
      return;
    }

    const token = this.auth.getToken();
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        this.userName = decoded.sub?.split('@')[0] ?? 'Usuario';
      } catch {}
    }
  }

  canSee(link: string): boolean {
    switch (this.userRole) {
      case 'SUPER_ADMIN':
        return ['dashboard', 'organizations', 'users', 'courses', 'attendance'].includes(link);
      case 'ADMIN':
        return ['dashboard', 'users', 'courses', 'attendance'].includes(link);
      case 'INSTRUCTOR':
        return ['dashboard', 'courses', 'attendance'].includes(link);
      case 'USER':
        return ['courses', 'attendance'].includes(link);
      default:
        return false;
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.subRole?.unsubscribe();
    this.subLogin?.unsubscribe();
  }
}
