import { Component, OnDestroy, OnInit, input, output } from '@angular/core';

let nextModalId = 0;

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal implements OnInit, OnDestroy {
  readonly title = input('');

  readonly closed = output<void>();

  protected readonly titleId = `modal-title-${nextModalId++}`;

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target !== event.currentTarget) {
      return;
    }

    this.close();
  }

  protected close(): void {
    this.closed.emit();
  }
}
