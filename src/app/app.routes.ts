import { Routes } from '@angular/router';
import { canActivateAuth } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { RegisterComponent } from './features/auth/register/register.component';

export const routes: Routes = [
  // 🔹 LOGIN (público)
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
      // 🏠 DASHBOARD
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },

      // 👥 USUARIOS
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/users/users.page').then((m) => m.UsersPage),
      },

      // 🏢 ORGANIZACIONES
      {
        path: 'organizations',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './features/organizations/pages/organization-list/organization-list.page'
              ).then((m) => m.OrganizationListPage),
          },
          {
            path: 'new',
            loadComponent: () =>
              import(
                './features/organizations/pages/organization-form/organization-form.page'
              ).then((m) => m.OrganizationFormPage),
          },
          {
            path: ':id',
            loadComponent: () =>
              import(
                './features/organizations/pages/organization-detail/organization-detail.page'
              ).then((m) => m.OrganizationDetailPage),
          },
        ],
      },

      // 📚 CURSOS
      {
        path: 'courses',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import(
            './features/courses/pages/course-list/courses.list.page'
          ).then((m) => m.CourseListPage),
      },
      {
        path: 'courses/new',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        loadComponent: () =>
          import(
            './features/courses/pages/course-form/course-form.page'
          ).then((m) => m.CourseFormPage),
      },

      // 🧾 ASISTENCIA (INSTRUCTOR, ADMIN, SUPER_ADMIN)
     {
  path: 'attendance/take/:classId',
  canActivate: [canActivateAuth, roleGuard],
  data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
  loadComponent: () =>
    import('./features/attendance/pages/attendance-take/attendance-take.page')
      .then((m) => m.AttendanceTakePage),
},


      {
        path: 'attendance',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/attendance/pages/attendance.page').then(
            (m) => m.AttendancePage
          ),
      },

      
{
  path: 'attendance/class/:classId',
  canActivate: [roleGuard],
  data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
  loadComponent: () =>
    import('./features/classes/pages/class-detail/class-detail.page')
      .then(m => m.ClassDetailPage)
}


,
      // 📝 REGISTRO DE USUARIOS
      {
        path: 'register',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        component: RegisterComponent,
      },
    ],
  },

  // 🔹 CUALQUIER OTRA RUTA
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
  path: 'attendance/class/:courseId',
  loadComponent: () => import('./features/classes/pages/class-detail/class-detail.page').then(m => m.ClassDetailPage)
},
{
  path: 'attendance/take/:classId',
  loadComponent: () => import('./features/attendance/pages/attendance-take/attendance-take.page').then(m => m.AttendanceTakePage)
},

];
