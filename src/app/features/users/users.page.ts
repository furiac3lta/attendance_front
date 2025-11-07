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
  selectedCourses: Record<number, number[]> = {};

  editingUserId: number | null = null;

  form = this.fb.group({
    username: ['', Validators.required],
    email: [''],
    password: [''],
    role: ['USER', Validators.required]
  });

  ngOnInit() {
    this.loadUsers();
    this.loadCourses();
  }

  // 🔹 Cargar usuarios según el rol (usa /users/visible)
  loadUsers() {
    this.usersSvc.findVisible().subscribe({
      next: (res) => {
        this.users = res || [];
        console.log('✅ Usuarios visibles cargados:', this.users);
      },
      error: (err) => {
        console.error('❌ Error al cargar usuarios visibles:', err);
        this.snackbar.show('❌ Error al cargar usuarios visibles');
      }
    });
  }

  // 🔹 Cargar cursos (el instructor verá solo los suyos desde el backend)
  loadCourses() {
    this.coursesSvc.findAll().subscribe({
      next: (res) => {
        this.courses = res || [];
        console.log('✅ Cursos cargados:', this.courses);
      },
      error: (err) => {
        console.error('❌ Error al cargar cursos:', err);
        this.snackbar.show('❌ Error al cargar cursos');
      }
    });
  }

  // 🔹 Crear o actualizar usuario
  saveUser() {
    if (this.form.invalid) {
      this.snackbar.show('⚠️ Completa los campos requeridos');
      return;
    }

    const dto = this.form.value;

    const payload = {
      fullName: dto.username ?? '',
      email: dto.email || `${dto.username}@dojo.com`,
      password: dto.password || '',
      role: dto.role || 'USER'
    };

    if (this.editingUserId) {
      // 🟢 Actualizar usuario existente
      this.usersSvc.update(this.editingUserId, payload).subscribe({
        next: (res: any) => {
          console.log('✅ Usuario actualizado:', res);
          this.snackbar.show('✅ Usuario actualizado correctamente');
          this.loadUsers();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('❌ Error al actualizar usuario:', err);
          this.snackbar.show('❌ Error al actualizar usuario');
        }
      });
    } else {
      // 🆕 Crear usuario nuevo
      this.usersSvc.create(payload).subscribe({
        next: () => {
          this.snackbar.show('✅ Usuario creado correctamente');
          this.form.reset({ role: 'USER' });
          this.loadUsers();
        },
        error: (err) => {
          console.error('❌ Error al crear usuario:', err);
          this.snackbar.show('❌ Error al crear usuario');
        }
      });
    }
  }

  // 🔹 Iniciar edición
  editUser(user: User): void {
    this.editingUserId = user.id!;
    this.form.patchValue({
      username: user.fullName || user['username'] || '',
      email: user.email || '',
      password: '',
      role: typeof user.role === 'string' ? user.role : 'USER'
    });
    this.snackbar.show(`✏️ Editando usuario: ${user.fullName}`);
  }

  // 🔹 Cancelar edición
  cancelEdit() {
    this.editingUserId = null;
    this.form.reset({ role: 'USER' });
  }

  // 🔹 Eliminar usuario
  deleteUser(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;

    this.usersSvc.remove(id).subscribe({
      next: () => {
        this.snackbar.show('✅ Usuario eliminado correctamente');
        this.loadUsers();
      },
      error: (err) => {
        console.error('❌ Error al eliminar usuario:', err);
        this.snackbar.show('❌ No se pudo eliminar el usuario');
      }
    });
  }

  // 🔹 Mostrar nombres de cursos
  getCourseNames(user: any): string {
    if (!user?.courses?.length) return 'Sin cursos';
    return user.courses.map((c: any) => c.name).join(', ');
  }

  // 🔹 Guardar cursos seleccionados
  saveCourses(userId: number) {
    const courseIds = this.selectedCourses[userId] || [];

    if (!courseIds.length) {
      this.snackbar.show('⚠️ Selecciona al menos un curso');
      return;
    }

    this.usersSvc.assignCourses(userId, courseIds).subscribe({
      next: (response: any) => {
        console.log('📩 Respuesta backend:', response);

        if (typeof response === 'object' && response.courses) {
          const index = this.users.findIndex(u => u.id === userId);
          if (index !== -1) {
            this.users[index].courses = response.courses;
          }
        } else {
          this.loadUsers();
        }

        this.snackbar.show('✅ Cursos asignados correctamente');
      },
      error: (err) => {
        console.error('❌ Error al asignar cursos:', err);
        this.snackbar.show('❌ Error al asignar cursos');
      }
    });
  }

  // 🔹 Manejar cambios en el select múltiple
  onCoursesChange(userId: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedIds = Array.from(select.selectedOptions).map(opt => Number(opt.value));
    this.selectedCourses[userId] = selectedIds;
    console.log(`📘 Cursos seleccionados para user ${userId}:`, selectedIds);
  }
}
