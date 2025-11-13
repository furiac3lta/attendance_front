// src/app/features/users/users.page.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, Validators } from '@angular/forms';
import { UsersService, User, PageResponse } from '../../core/services/users.service';
import { CoursesService } from '../../core/services/courses.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { MaterialModule } from '../../material.module';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  standalone: true,
  selector: 'app-users-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatChipsModule
  ],
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.css']
})
export class UsersPage implements OnInit {

  private fb = inject(FormBuilder);
  private usersSvc = inject(UsersService);
  private coursesSvc = inject(CoursesService);
  private snackbar = inject(SnackbarService);

  users: User[] = [];
  courses: any[] = [];
  organizations: any[] = [];
  selectedCourses: Record<number, number[]> = {};

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
    organizationId: [null as number | null],
    courseIds: [[] as number[]] // SE GUARDAN ACA LOS IDS
  });

  ngOnInit() {
    this.loadCourses(); // importante cargar cursos antes de users
    this.loadUsers();
    if (this.currentRole === 'SUPER_ADMIN') this.loadOrganizations();
  }

  // ============================================
  // CARGA DE USERS
  // ============================================
  loadUsers() {
    this.loading = true;
    this.usersSvc.findAll(this.currentPage, this.pageSize).subscribe({
      next: (res: PageResponse<User>) => {

        this.users = Array.isArray(res?.content) ? res.content : [];
        this.totalPages = res?.totalPages ?? 1;
        this.totalElements = res?.totalElements ?? this.users.length;
        this.currentPage = res?.number ?? 0;

        // ⭐ Convertimos nombres de cursos -> IDS
        this.users.forEach(u => {
          this.selectedCourses[u.id] = this.mapCourseNamesToIds(u.courses || []);
        });

        this.loading = false;
      },
      error: () => {
        this.snackbar.show('❌ Error al cargar usuarios');
        this.loading = false;
      }
    });
  }

  // ============================================
  // MAPEO NOMBRE → ID
  // ============================================
  mapCourseNamesToIds(courseNames: string[]): number[] {
    return this.courses
      .filter(c => courseNames.includes(c.name))
      .map(c => c.id);
  }

  // ============================================
  // CARGA DE CURSOS Y ORGANIZACIONES
  // ============================================
  loadCourses() {
    this.coursesSvc.findAll().subscribe({
      next: res => this.courses = res,
      error: () => this.snackbar.show('❌ Error al cargar cursos')
    });
  }

  loadOrganizations() {
    this.usersSvc.getOrganizations().subscribe({
      next: res => this.organizations = res,
      error: () => this.snackbar.show('❌ Error al cargar organizaciones')
    });
  }

  // ============================================
  // CRUD USERS
  // ============================================
  saveUser() {
    if (this.form.invalid) return this.snackbar.show('⚠️ Completa los campos');

    const dto = this.form.value;

    const payload: any = {
      fullName: dto.username!,
      email: dto.email || `${dto.username}@dojo.com`,
      password: dto.password ?? '',
      role: dto.role!,
      courseIds: dto.courseIds || [] // ⭐ IMPORTANTE
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
        this.form.reset({ role: 'USER', courseIds: [] });
        this.editingUserId = null;
        this.loadUsers();
      },
      error: () => this.snackbar.show('❌ Error al guardar')
    });
  }

  editUser(user: User) {
    this.editingUserId = user.id!;

    const ids = this.mapCourseNamesToIds(user.courses || []);

    this.form.patchValue({
      username: user.fullName,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || null,
      courseIds: ids
    });

    this.selectedCourses[user.id] = ids;
  }

  cancelEdit() {
    this.editingUserId = null;
    this.form.reset({ role: 'USER', courseIds: [] });
  }

  deleteUser(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;

    this.usersSvc.remove(id).subscribe({
      next: () => {
        this.snackbar.show('🗑️ Usuario eliminado');
        this.loadUsers();
      },
      error: () => this.snackbar.show('❌ Error al eliminar')
    });
  }

  // ============================================
  // ASIGNAR CURSOS
  // ============================================
  saveCourses(userId: number) {
    const courseIds = this.selectedCourses[userId] || [];

    this.usersSvc.assignCourses(userId, courseIds).subscribe({
      next: () => {
        this.snackbar.show('✅ Cursos asignados');
        this.loadUsers();
      },
      error: () => this.snackbar.show('❌ Error al asignar cursos')
    });
  }

  onCoursesChange(userId: number, event: any) {
    this.selectedCourses[userId] = event.value;
    if (this.editingUserId === userId) {
      this.form.patchValue({ courseIds: event.value });
    }
  }

  // ============================================
  // PAGINADOR
  // ============================================
  onPaginatorChange(event: any) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadUsers();
  }

  trackByUserId = (_: number, u: User) => u.id;
}
