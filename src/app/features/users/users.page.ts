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

  // ===========================================================
  // INYECCIONES
  // ===========================================================
  private fb = inject(FormBuilder);
  private usersSvc = inject(UsersService);
  private coursesSvc = inject(CoursesService);

  // ===========================================================
  // ESTADO GENERAL
  // ===========================================================
  users: User[] = [];
  filteredUsers: User[] = [];

  // Filtros
  searchTerm: string = '';
  filterRole: string = 'ALL';
  filterOrg: number | 'ALL' = 'ALL';
  filterCourse: number | 'ALL' = 'ALL';

  // Datos
  courses: any[] = [];
  organizations: any[] = [];
  selectedCourses: Record<number, number[]> = {};

  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalPages = 1;
  totalElements = 0;

  // Flags
  loading = false;
  isSearching = false;

  currentRole: string | null = sessionStorage.getItem('role');
  editingUserId: number | null = null;

  // ===========================================================
  // FORMULARIO
  // ===========================================================
  form = this.fb.group({
    username: ['', Validators.required],
    email: [''],
    password: [''],
    role: ['USER', Validators.required],
    organizationId: [null as number | null],
    courseIds: [[] as number[]]
  });

  // ===========================================================
  // INIT
  // ===========================================================
  ngOnInit() {
    this.loadCourses();
    this.loadUsers();
    if (this.isSuperAdmin()) this.loadOrganizations();
  }

  // ===========================================================
  // ROLES
  // ===========================================================
  isSuperAdmin(): boolean {
    return this.currentRole === 'SUPER_ADMIN';
  }

  // ===========================================================
  // CARGA DE USERS
  // ===========================================================
  loadUsers() {
    this.loading = true;

    this.usersSvc.findAll(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (res: PageResponse<User>) => {
        this.users = res.content ?? [];
        this.totalPages = res.totalPages ?? 1;
        this.totalElements = res.totalElements ?? 0;
        this.currentPage = res.number ?? 0;

        this.applyFilter(false);

        this.loading = false;
      },
      error: () => {
        Swal.fire('Error', '❌ Error al cargar usuarios', 'error');
        this.loading = false;
      }
    });
  }

  // ===========================================================
  // CURSOS / ORGANIZACIONES
  // ===========================================================
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

  // ===========================================================
  // CRUD
  // ===========================================================
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

    if (this.isSuperAdmin() && dto.organizationId) {
      payload.organization = { id: dto.organizationId };
    }

    const req$ = this.editingUserId
      ? this.usersSvc.update(this.editingUserId, payload)
      : this.usersSvc.create(payload);

    req$.subscribe({
      next: () => {
        Swal.fire('Éxito', 'Usuario guardado correctamente', 'success');
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
          Swal.fire('Eliminado', 'Usuario eliminado', 'success');
          this.loadUsers();
        },
        error: () => Swal.fire('Error', '❌ Error al eliminar usuario', 'error')
      });
    });
  }

  // ===========================================================
  // ASIGNAR CURSOS
  // ===========================================================
  saveCourses(userId: number) {
    const courseIds = this.selectedCourses[userId] || [];

    this.usersSvc.assignCourses(userId, courseIds).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Cursos asignados correctamente', 'success');
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

  // ===========================================================
  // PAGINADOR
  // ===========================================================
  onPaginatorChange(event: any) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadUsers();
  }

  // ===========================================================
  // MAPEO
  // ===========================================================
  mapCourseNamesToIds(courseNames: string[]): number[] {
    return this.courses
      .filter(c => courseNames.includes(c.name))
      .map(c => c.id);
  }

  // ===========================================================
  // 🔍 FILTROS Y BÚSQUEDA LOCAL (SIN PAGINACIÓN)
  // ===========================================================
  applyFilter(triggerBackend: boolean = true) {
    const normalize = (str: string = '') =>
      str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    // Detecta si hay filtros activos
    const filtersActive =
      this.searchTerm.trim() !== '' ||
      this.filterRole !== 'ALL' ||
      this.filterOrg !== 'ALL' ||
      this.filterCourse !== 'ALL';

    this.isSearching = filtersActive;

    // Si debe recargar del backend
    if (triggerBackend && !filtersActive) {
      this.currentPage = 0;
      this.loadUsers();
      return;
    }

    const term = normalize(this.searchTerm);

    this.filteredUsers = this.users.filter(u => {
      const name = normalize(u.fullName);
      const email = normalize(u.email || '');
      const role = normalize(u.role || '');
      const org = normalize(u.organizationName || '');
      const courses = (u.courses || []).map(c => normalize(c));

      const matchesText =
        name.includes(term) ||
        email.includes(term) ||
        role.includes(term) ||
        org.includes(term) ||
        courses.some(c => c.includes(term));

      const matchesRole =
        this.filterRole === 'ALL' || u.role === this.filterRole;

      const matchesOrg =
        this.filterOrg === 'ALL' || u.organizationId === this.filterOrg;

      const matchesCourse =
        this.filterCourse === 'ALL' ||
        (u.courses || []).includes(
          this.courses.find(c => c.id === this.filterCourse)?.name
        );

      return matchesText && matchesRole && matchesOrg && matchesCourse;
    });

    // Si está buscando → sin paginado
    this.totalElements = this.isSearching ? this.filteredUsers.length : this.users.length;
  }

  trackByUserId = (_: number, u: User) => u.id;
  
}
