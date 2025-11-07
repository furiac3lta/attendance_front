import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 🔹 Si no hay token → sesión expirada → ir al login
  const token = authService.getToken();
  if (!token) {
    alert('⚠️ Tu sesión ha expirado. Iniciá sesión nuevamente.');
    router.navigate(['/login']);
    return false;
  }

  // 🔹 Obtener rol actual
  const role = authService.getRole()?.replace(/^ROLE_/, '').toUpperCase() || '';

  // 🔹 Roles permitidos
  const allowedRoles = (route.data?.['roles'] || []).map((r: string) => r.toUpperCase());

  // ✅ Si no hay restricción → acceso permitido
  if (allowedRoles.length === 0) return true;

  // ✅ Si el rol tiene permiso → permitir
  if (allowedRoles.includes(role)) {
    return true;
  }

  // 🚫 Si no tiene permiso → mostrar mensaje y quedarse en la página
  alert('🚫 No tenés permiso para acceder a esta sección.');
  console.warn(`Acceso denegado: rol "${role}" no autorizado para ${state.url}`);

  // ❌ No redirige, simplemente cancela la navegación
  return false;
};
