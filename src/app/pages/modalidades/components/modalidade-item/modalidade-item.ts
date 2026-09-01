import { Component, computed, input } from '@angular/core';

import { EstabelecimentoViewMode, Modalidade } from '../../../estabelecimentos/types/types';

@Component({
  selector: 'app-modalidade-item',
  imports: [],
  templateUrl: './modalidade-item.html',
  styleUrl: './modalidade-item.scss',
})
export class ModalidadeItem {
  readonly modalidade = input.required<Modalidade>();
  readonly viewMode = input<EstabelecimentoViewMode>('list');

  readonly initials = computed(() => {
    const [firstWord = '', secondWord = ''] = this.modalidade().nome.trim().split(/\s+/);
    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
  });

  readonly formattedStatus = computed(() => (this.modalidade().ativo ? 'Ativa' : 'Inativa'));

  readonly statusClass = computed(() => (
    this.modalidade().ativo ? 'modalidade-item-status--active' : 'modalidade-item-status--inactive'
  ));
}
