// src/app/features/courses/models/course.models.ts

import { User } from '../../../core/models/user.models';

export interface Course {
  id?: number;
  name: string;
  description?: string;
  universityProgram?: string;

  // 🔹 Instructor asignado al curso
  instructor?: User;

  // 🔹 Alumnos inscriptos
  students?: User[];

  // 🔹 Organización a la que pertenece
  organization?: {
    id: number;
    name: string;
  };
}
