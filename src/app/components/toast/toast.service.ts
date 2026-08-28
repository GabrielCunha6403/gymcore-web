import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 1;
  private readonly messages = signal<ToastMessage[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  readonly toasts = this.messages.asReadonly();

  success(title: string, description?: string, duration = 5000): void {
    this.show('success', title, description, duration);
  }

  error(title: string, description?: string, duration = 5000): void {
    this.show('error', title, description, duration);
  }

  warning(title: string, description?: string, duration = 5000): void {
    this.show('warning', title, description, duration);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);

    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }

  private show(type: ToastType, title: string, description?: string, duration = 5000): void {
    const id = this.nextId++;
    const message: ToastMessage = {
      id,
      type,
      title,
      description,
      duration,
    };

    this.messages.update((messages) => [...messages, message]);
    this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
  }
}
