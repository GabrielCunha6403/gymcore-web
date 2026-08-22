import { Component, computed, input } from '@angular/core';
import { Estabelecimento, EstabelecimentoViewMode, StatusEstabelecimento } from '../../types/types';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-estabelecimento-item',
  imports: [
    RouterLink
  ],
  templateUrl: './estabelecimento-item.html',
  styleUrl: './estabelecimento-item.scss',
})
export class EstabelecimentoItem {
  readonly estabelecimento = input.required<Estabelecimento>();
  readonly viewMode = input<EstabelecimentoViewMode>('list');

  readonly initials = computed(() => {
    const [firstWord = '', secondWord = ''] = this.estabelecimento().nomeFantasia.trim().split(/\s+/);
    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
  });

  readonly formattedStatus = computed(() => this.formatStatus(this.estabelecimento().status));
  readonly statusClass = computed(() => {
    const status = this.estabelecimento().status;

    if (status === 'INATIVO') {
      return 'estabelecimento-item__status--inactive';
    }

    if (status === 'BLOQUEADO') {
      return 'estabelecimento-item__status--blocked';
    }

    return 'estabelecimento-item__status--active';
  });
  readonly formattedUnits = computed(() => {
    const total = this.estabelecimento().quantidadeUnidades;
    return `${total} ${total === 1 ? 'unidade' : 'unidades'}`;
  });

  private formatStatus(status: StatusEstabelecimento): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }
}
