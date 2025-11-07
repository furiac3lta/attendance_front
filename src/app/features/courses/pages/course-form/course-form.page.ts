import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CoursesService } from '../../../../core/services/courses.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-course-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-form.page.html',
  styleUrls: ['./course-form.page.css']
})
export class CourseFormPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private coursesSvc = inject(CoursesService);

  // ✅ Formulario con validaciones básicas
  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    universityProgram: [''],
    instructorId: [1]
  });

  // ✅ Crear curso
  createCourse() {
    if (this.form.invalid) {
      alert('Por favor, completá los campos requeridos.');
      return;
    }

    const dto = this.form.value;

    const payload = {
      name: dto.name ?? '',
      description: dto.description ?? '',
      universityProgram: dto.universityProgram ?? '',
      instructorId: dto.instructorId ?? 1
    };

    this.coursesSvc.create(payload).subscribe({
      next: (res) => {
        console.log('✅ Curso creado correctamente:', res);

        // Mostrar mensaje visual
        alert('✅ Curso creado correctamente');

        // Redirigir al listado de cursos
      this.router.navigateByUrl('/courses').then(ok => console.log('🔁 navigateByUrl ejecutado:', ok));

      },
      error: (err: any) => {
        console.error('❌ Error al crear curso:', err);
        alert('❌ Ocurrió un error al crear el curso');
      }
    });
  }
}
