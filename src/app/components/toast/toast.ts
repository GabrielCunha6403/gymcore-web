import { Component, computed, inject } from '@angular/core';

import { ToastMessage, ToastService, ToastType } from './toast.service';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  private readonly toastService = inject(ToastService);

  protected readonly toasts = computed(() => this.toastService.toasts());

  protected dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  protected icon(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      success: 'pi pi-check-circle',
      error: 'pi pi-times-circle',
      warning: 'pi pi-exclamation-triangle',
    };

    return icons[type];
  }

  protected ariaLabel(toast: ToastMessage): string {
    const typeLabels: Record<ToastType, string> = {
      success: 'Sucesso',
      error: 'Erro',
      warning: 'Aviso',
    };

    return `${typeLabels[toast.type]}: ${toast.title}`;
  }
}
