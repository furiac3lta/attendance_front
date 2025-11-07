import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrganizationsService } from '../../../../core/services/organizations.service';
import { Organization } from '../../models/organization.model';

@Component({
  selector: 'app-organization-detail-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organization-detail.page.html',
  styleUrls: ['./organization-detail.page.css'],
})
export class OrganizationDetailPage implements OnInit {
  organization?: Organization;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private orgService: OrganizationsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadOrganization(id);
  }

  loadOrganization(id: number): void {
    this.orgService.findById(id).subscribe({
      next: (res) => {
        this.organization = res;
        console.log('🏢 Detalle organización:', res);
      },
      error: (err) => {
        console.error('❌ Error al cargar detalle:', err);
        this.message = '❌ No se pudo cargar la organización.';
      },
    });
  }
}
