// src/app/features/users/users.page.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, Validators } from '@angular/forms';
import { UsersService, User, PageResponse } from '../../core/services/users.service';
import { CoursesService } from '../../core/services/courses.service';
import { SnackbarService } from '../../shared/services/snackbar.service';

@Component({
  standalone: true,
  selector: 'app-users-page',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.css']
})
export class UsersPage implements OnInit {
  private fb = inject(FormBuilder);
  private usersSvc = inject(UsersService);
  private coursesSvc = inject(CoursesService);
  private snackbar = inject(SnackbarService);

  users: User[] = [];                    // SIEMPRE array (evita NG02200)
  courses: any[] = [];
  organizations: any[] = [];
  selectedCourses: Record<number, number[]> = {};

  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalPages = 1;
  totalElements = 0;
  loading = false;

  currentRole: string | null = sessionStorage.getItem('role');
  editingUserId: number | null = null;

  form = this.fb.group({
    username: ['', Validators.required],
    email: [''],
    password: [''],
    role: ['USER', Validators.required],
    organizationId: [null as number | null]
  });

  ngOnInit() {
    this.loadUsers();
    this.loadCourses();
    if (this.currentRole === 'SUPER_ADMIN') this.loadOrganizations();
  }

  // ✅ Cargar usuarios paginados
  loadUsers() {
    this.loading = true;
    this.usersSvc.findAll(this.currentPage, this.pageSize).subscribe({
      next: (res: PageResponse<User>) => {
        // Aseguramos array (evita NG02200)
        this.users = Array.isArray(res?.content) ? res.content : [];
        this.totalPages = res?.totalPages ?? 1;
        this.totalElements = res?.totalElements ?? this.users.length;
        this.currentPage = res?.number ?? 0;
        this.loading = false;
        // console.log('DEBUG USERS PAGE RESPONSE:', res);
      },
      error: () => {
        this.snackbar.show('❌ Error al cargar usuarios');
        this.loading = false;
      }
    });
  }

  // Pagination buttons
  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  // Helpers
  loadCourses() {
    this.coursesSvc.findAll().subscribe({
      next: (res: any[]) => this.courses = Array.isArray(res) ? res : [],
      error: () => this.snackbar.show('❌ Error al cargar cursos')
    });
  }
  loadOrganizations() {
    this.usersSvc.getOrganizations().subscribe({
      next: (res: any[]) => this.organizations = Array.isArray(res) ? res : [],
      error: () => this.snackbar.show('❌ Error al cargar organizaciones')
    });
  }

  // CRUD
  saveUser() {
    if (this.form.invalid) return this.snackbar.show('⚠️ Completa los campos requeridos');
    const dto = this.form.value;

    const payload: any = {
      fullName: dto.username!,
      email: dto.email || `${dto.username}@dojo.com`,
      password: dto.password ?? '',
      role: dto.role!
    };
    if (this.currentRole === 'SUPER_ADMIN' && dto.organizationId) {
      payload.organization = { id: dto.organizationId };
    }

    const req$ = this.editingUserId
      ? this.usersSvc.update(this.editingUserId, payload)
      : this.usersSvc.create(payload);

    req$.subscribe({
      next: () => {
        this.snackbar.show('✅ Usuario guardado');
        this.form.reset({ role: 'USER' });
        this.editingUserId = null;
        this.loadUsers();
      },
      error: () => this.snackbar.show('❌ Error al guardar usuario')
    });
  }

  editUser(user: User): void {
    this.editingUserId = user.id!;
    this.form.patchValue({
      username: user.fullName || '',
      email: user.email || '',
      role: user.role || 'USER',
      organizationId: user.organizationId ?? null
    });
  }

  cancelEdit() {
    this.editingUserId = null;
    this.form.reset({ role: 'USER' });
  }

  deleteUser(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.usersSvc.remove(id).subscribe({
      next: () => { this.snackbar.show('🗑️ Usuario eliminado'); this.loadUsers(); },
      error: () => this.snackbar.show('❌ No se pudo eliminar usuario')
    });
  }

  saveCourses(userId: number) {
    const courseIds = this.selectedCourses[userId] || [];
    if (!courseIds.length) return this.snackbar.show('⚠️ Selecciona cursos');
    this.usersSvc.assignCourses(userId, courseIds).subscribe({
      next: () => { this.snackbar.show('✅ Cursos asignados'); this.loadUsers(); },
      error: () => this.snackbar.show('❌ Error al asignar cursos')
    });
  }

  onCoursesChange(userId: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedCourses[userId] = Array.from(select.selectedOptions).map(opt => Number(opt.value));
  }

  // Evita errores de template con opcionales
  trackByUserId = (_: number, u: User) => u.id;
}
