import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  show(message: string): void {
    // 👇 Por ahora usa un alert. Luego podés reemplazar por Angular Material Snackbar o Toastr
    alert(message);
  }
}
