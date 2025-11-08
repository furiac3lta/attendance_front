import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationsService } from '../../../../core/services/organizations.service';
import { UsersService } from '../../../../core/services/users.service';
import { SnackbarService } from '../../../../shared/services/snackbar.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './organization-list.page.html',
  styleUrls: ['./organization-list.page.css'],
})
export class OrganizationListPage {
  private orgService = inject(OrganizationsService);
  private usersService = inject(UsersService);
  private snackbar = inject(SnackbarService);

  organizations: any[] = [];
  admins: any[] = [];
  selectedAdmin: Record<number, number | null> = {};
userRole: string | null = sessionStorage.getItem('role');

  ngOnInit() {
    this.loadOrganizations();
    this.loadAdmins();
  }

  // 🔹 Cargar todas las organizaciones
  loadOrganizations() {
    this.orgService.findAll().subscribe({
      next: (res) => {
        this.organizations = res || [];
        console.log('✅ Organizaciones cargadas:', this.organizations);
      },
      error: (err) => {
        console.error('❌ Error al cargar organizaciones:', err);
        this.snackbar.show('❌ No se pudieron cargar las organizaciones');
      },
    });
  }

  // 🔹 Cargar solo usuarios ADMIN
  loadAdmins() {
    this.usersService.findAll().subscribe({
      next: (res) => {
          console.log("📦 Organizaciones recibidas del backend:", res);

        this.admins = (res || []).filter((u: any) => String(u.role).toUpperCase() === 'ADMIN');

        console.log('✅ Admins disponibles:', this.admins);
      },
      error: () => this.snackbar.show('❌ Error al cargar usuarios'),
    });
  }

  // 🔹 Asignar administrador a una organización
  assignAdmin(orgId: number) {
    const adminId = this.selectedAdmin[orgId];
    if (!adminId) {
      this.snackbar.show('⚠️ Seleccioná un administrador');
      return;
    }

    this.orgService.assignAdmin(orgId, adminId).subscribe({
      next: () => {
        this.snackbar.show('✅ Administrador asignado correctamente');
        this.loadOrganizations();
      },
      error: (err) => {
        console.error('❌ Error al asignar administrador:', err);
        this.snackbar.show('❌ No se pudo asignar el administrador');
      },
    });
  }

  // 🔹 Eliminar organización
  deleteOrganization(id: number) {
    if (!confirm('¿Eliminar esta organización?')) return;

    this.orgService.delete(id).subscribe({
      next: () => {
        this.snackbar.show('✅ Organización eliminada');
        this.loadOrganizations();
      },
      error: (err) => {
        console.error('❌ Error al eliminar organización:', err);
        this.snackbar.show('❌ No se pudo eliminar la organización');
      },
    });
  }
}
