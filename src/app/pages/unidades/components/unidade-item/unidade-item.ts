import { Component, computed, input } from '@angular/core';

import { EstabelecimentoViewMode, StatusEstabelecimento, TipoEstabelecimento, Unidade } from '../../../estabelecimentos/types/types';

@Component({
  selector: 'app-unidade-item',
  templateUrl: './unidade-item.html',
  styleUrl: './unidade-item.scss',
})
export class UnidadeItem {
  readonly unidade = input.required<Unidade>();
  readonly viewMode = input<EstabelecimentoViewMode>('list');

  readonly initials = computed(() => {
    const [firstWord = '', secondWord = ''] = this.unidade().nome.trim().split(/\s+/);
    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
  });
  readonly formattedStatus = computed(() => this.formatStatus(this.unidade().status));
  readonly formattedType = computed(() => this.formatType(this.unidade().tipo));
  readonly formattedLocation = computed(() => `${this.unidade().endereco.cidade} - ${this.unidade().endereco.uf}`);
  readonly statusClass = computed(() => {
    const status = this.unidade().status;

    if (status === 'INATIVO') {
      return 'unidade-item__status--inactive';
    }

    if (status === 'BLOQUEADO') {
      return 'unidade-item__status--blocked';
    }

    return 'unidade-item__status--active';
  });

  private formatStatus(status: StatusEstabelecimento): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  private formatType(tipo: TipoEstabelecimento): string {
    return tipo
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
