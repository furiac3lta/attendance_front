import { Routes } from '@angular/router';
import { canActivateAuth } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { RegisterComponent } from './features/auth/register/register.component';

export const routes: Routes = [

  // 🔹 LOGIN (Público)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.page').then((m) => m.LoginPage),
  },

  // 🔹 RUTAS PROTEGIDAS
  {
    path: '',
    canActivate: [canActivateAuth],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // 🏠 Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },

      // 👥 Usuarios
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/users/users.page').then((m) => m.UsersPage),
      },

      // 🏢 Organizaciones
      {
        path: 'organizations',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/organizations/pages/organization-list/organization-list.page')
                .then((m) => m.OrganizationListPage),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/organizations/pages/organization-form/organization-form.page')
                .then((m) => m.OrganizationFormPage),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/organizations/pages/organization-detail/organization-detail.page')
                .then((m) => m.OrganizationDetailPage),
          },
        ],
      },

      // 📚 Cursos
      {
        path: 'courses',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/courses/pages/course-list/courses.list.page')
            .then((m) => m.CourseListPage),
      },
      {
        path: 'courses/new',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        loadComponent: () =>
          import('./features/courses/pages/course-form/course-form.page')
            .then((m) => m.CourseFormPage),
      },

      // 🧾 Asistencia
      {
        path: 'attendance',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/attendance/pages/attendance.page')
            .then(m => m.AttendancePage),
      },

      // ✅ VER LISTA DE CLASES DE UN CURSO
      {
        path: 'attendance/class/:courseId', // <-- esta es la correcta
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/classes/pages/class-detail/class-detail.page')
            .then(m => m.ClassDetailPage),
      },

      // ✅ TOMAR O EDITAR ASISTENCIA
      {
        path: 'attendance/take/:classId',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/attendance/pages/attendance-take/attendance-take.page')
            .then(m => m.AttendanceTakePage),
      },

      // ✅ Ver asistencia tomada
      {
        path: 'attendance/view/:classId',
        loadComponent: () =>
          import('./features/attendance/pages/attendance-view/attendance-view.page')
            .then(m => m.AttendanceViewPage),
      },

      // ✅ Reporte mensual
      {
        path: 'attendance/report/:courseId',
        loadComponent: () =>
          import('./features/attendance/pages/course-report/course-report.page')
            .then(m => m.CourseReportPage),
      },

      // 📝 Registro de usuarios
      {
        path: 'register',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        component: RegisterComponent,
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
];
