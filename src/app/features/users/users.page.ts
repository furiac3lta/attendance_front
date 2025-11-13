// src/app/features/users/users.page.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, Validators } from '@angular/forms';
import { UsersService, User, PageResponse } from '../../core/services/users.service';
import { CoursesService } from '../../core/services/courses.service';
import { MaterialModule } from '../../material.module';
import { MatChipsModule } from '@angular/material/chips';
import Swal from 'sweetalert2';

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
    courseIds: [[] as number[]]
  });

  ngOnInit() {
    this.loadCourses();
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

        this.users.forEach(u => {
          this.selectedCourses[u.id] = this.mapCourseNamesToIds(u.courses || []);
        });

        this.loading = false;
      },
      error: () => {
        Swal.fire('Error', '❌ Error al cargar usuarios', 'error');
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
      error: () => Swal.fire('Error', '❌ Error al cargar cursos', 'error')
    });
  }

  loadOrganizations() {
    this.usersSvc.getOrganizations().subscribe({
      next: res => this.organizations = res,
      error: () => Swal.fire('Error', '❌ Error al cargar organizaciones', 'error')
    });
  }

  // ============================================
  // CRUD USERS
  // ============================================
  saveUser() {
    if (this.form.invalid) {
      Swal.fire('Atención', '⚠️ Completa los campos requeridos', 'warning');
      return;
    }

    const dto = this.form.value;

    const payload: any = {
      fullName: dto.username!,
      email: dto.email || `${dto.username}@dojo.com`,
      password: dto.password ?? '',
      role: dto.role!,
      courseIds: dto.courseIds || []
    };

    if (this.currentRole === 'SUPER_ADMIN' && dto.organizationId) {
      payload.organization = { id: dto.organizationId };
    }

    const req$ = this.editingUserId
      ? this.usersSvc.update(this.editingUserId, payload)
      : this.usersSvc.create(payload);

    req$.subscribe({
      next: () => {
        Swal.fire('Éxito', '✅ Usuario guardado correctamente', 'success');
        this.form.reset({ role: 'USER', courseIds: [] });
        this.editingUserId = null;
        this.loadUsers();
      },
      error: () => Swal.fire('Error', '❌ Error al guardar usuario', 'error')
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
    Swal.fire({
      title: '¿Eliminar este usuario?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {

      if (!result.isConfirmed) return;

      this.usersSvc.remove(id).subscribe({
        next: () => {
          Swal.fire('Eliminado', '🗑️ Usuario eliminado', 'success');
          this.loadUsers();
        },
        error: () => Swal.fire('Error', '❌ Error al eliminar usuario', 'error')
      });
    });
  }

  // ============================================
  // ASIGNAR CURSOS
  // ============================================
  saveCourses(userId: number) {
    const courseIds = this.selectedCourses[userId] || [];

    this.usersSvc.assignCourses(userId, courseIds).subscribe({
      next: () => {
        Swal.fire('Éxito', '✅ Cursos asignados correctamente', 'success');
        this.loadUsers();
      },
      error: () => Swal.fire('Error', '❌ Error al asignar cursos', 'error')
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
