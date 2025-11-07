import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const canActivateAuth: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // 🔹 Buscar token y rol
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const rawRole = sessionStorage.getItem('role') || localStorage.getItem('role');

  // ⚠️ Solo redirige al login si realmente NO hay token
  if (!token) {
    console.warn('⚠️ No hay token, redirigiendo al login...');
    router.navigate(['/login']);
    return false;
  }

  // 🔹 Normalizar formato de rol (ej: ROLE_SUPER_ADMIN → SUPER_ADMIN)
  const role = rawRole?.replace(/^ROLE_/, '').toUpperCase() || '';

  // 🔹 Verificar si la ruta define roles permitidos
  const allowedRoles = (route.data?.['roles'] || []).map((r: string) => r.toUpperCase());

  // 🔹 Si no hay restricción → permitir acceso
  if (allowedRoles.length === 0) return true;

  // 🔹 Si el rol tiene permiso → permitir acceso
  if (allowedRoles.includes(role)) return true;

  // 🚫 Si no tiene permiso → mostrar alerta, pero NO romper sesión
  alert('🚫 Acceso restringido: tu rol no tiene permisos para acceder a esta sección.');
  console.warn(`Acceso denegado para rol "${role}" en ruta ${state.url}`);
  router.navigate(['/dashboard']); // redirige al panel, no al login
  return false;
};
