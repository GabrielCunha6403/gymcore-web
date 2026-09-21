import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EstabelecimentoViewMode, Modalidade } from '../../../estabelecimentos/types/types';
import { Modal } from '../../../../components/modal/modal';

@Component({
  selector: 'app-modalidade-item',
  imports: [RouterLink, Modal],
  templateUrl: './modalidade-item.html',
  styleUrl: './modalidade-item.scss',
})
export class ModalidadeItem {
  readonly modalidade = input.required<Modalidade>();
  readonly viewMode = input<EstabelecimentoViewMode>('list');
  readonly inativar = output<string>();

  protected readonly confirmandoInativacao = signal(false);

  protected onDeleteClick(): void {
    this.confirmandoInativacao.set(true);
  }

  protected confirmInativar(): void {
    this.confirmandoInativacao.set(false);
    this.inativar.emit(this.modalidade().id);
  }

  readonly initials = computed(() => {
    const [firstWord = '', secondWord = ''] = this.modalidade().nome.trim().split(/\s+/);
    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
  });

  readonly formattedStatus = computed(() => (this.modalidade().ativo ? 'Ativa' : 'Inativa'));

  readonly statusClass = computed(() => (
    this.modalidade().ativo ? 'modalidade-item-status--active' : 'modalidade-item-status--inactive'
  ));
}
