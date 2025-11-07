import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrganizationsService } from '../../../../core/services/organizations.service';
import { Organization } from '../../models/organization.model';

@Component({
  selector: 'app-organization-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './organization-form.page.html',
  styleUrls: ['./organization-form.page.css'],
})
export class OrganizationFormPage {
  orgForm: FormGroup;
  message = '';

  constructor(
    private fb: FormBuilder,
    private orgService: OrganizationsService,
    private router: Router
  ) {
    this.orgForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      address: [''],
      phone: [''],
      logoUrl: [''],
    });
  }

  onSubmit(): void {
    if (this.orgForm.invalid) {
      this.message = '⚠️ Completá los campos requeridos.';
      return;
    }

    const payload: Organization = this.orgForm.value;

    this.orgService.create(payload).subscribe({
      next: (res) => {
        console.log('✅ Organización creada:', res);
        this.message = '✅ Organización creada correctamente.';
        this.router.navigate(['/organizations']);
      },
      error: (err) => {
        console.error('❌ Error al crear organización:', err);
        this.message = '❌ Error al crear organización.';
      },
    });
  }
}
