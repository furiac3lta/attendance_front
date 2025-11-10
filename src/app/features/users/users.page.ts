import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, Validators } from '@angular/forms';
import { UsersService, User } from '../../core/services/users.service';
import { CoursesService } from '../../core/services/courses.service';
import { SnackbarService } from '../../shared/services/snackbar.service';

@Component({
  standalone: true,
  selector: 'app-users-page',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.css']
})
export class UsersPage {
  private fb = inject(FormBuilder);
  private usersSvc = inject(UsersService);
  private coursesSvc = inject(CoursesService);
  private snackbar = inject(SnackbarService);

  users: User[] = [];
  courses: any[] = [];
  organizations: any[] = [];
  selectedCourses: Record<number, number[]> = {};

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

  loadUsers() {
    this.usersSvc.findAll().subscribe({
      next: (res) => this.users = res,
      error: () => this.snackbar.show('❌ Error al cargar usuarios')
    });
  }

  loadCourses() {
    this.coursesSvc.findAll().subscribe({
      next: (res) => this.courses = res,
      error: () => this.snackbar.show('❌ Error al cargar cursos')
    });
  }

  loadOrganizations() {
    this.usersSvc.getOrganizations().subscribe({
      next: (res) => this.organizations = res,
      error: () => this.snackbar.show('❌ Error al cargar organizaciones')
    });
  }

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

    const request = this.editingUserId
      ? this.usersSvc.update(this.editingUserId, payload)
      : this.usersSvc.create(payload);

    request.subscribe({
      next: () => {
        this.snackbar.show('✅ Usuario guardado');
        this.form.reset({ role: 'USER' });
        this.loadUsers();
        this.editingUserId = null;
      },
      error: () => this.snackbar.show('❌ Error al guardar usuario')
    });
  }

  editUser(user: User): void {
  this.editingUserId = user.id!;
  this.form.patchValue({
    username: user.fullName,
    email: user.email,
    role: user.role,
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
      next: () => this.loadUsers(),
      error: () => this.snackbar.show('❌ No se pudo eliminar usuario')
    });
  }

  saveCourses(userId: number) {
    const courseIds = this.selectedCourses[userId] || [];
    if (!courseIds.length) return this.snackbar.show('⚠️ Selecciona cursos');

    this.usersSvc.assignCourses(userId, courseIds).subscribe({
      next: () => {
        this.snackbar.show('✅ Cursos asignados');
        this.loadUsers();
      },
      error: () => this.snackbar.show('❌ Error al asignar cursos')
    });
  }

  onCoursesChange(userId: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedCourses[userId] =
      Array.from(select.selectedOptions).map(opt => Number(opt.value));
  }
}
