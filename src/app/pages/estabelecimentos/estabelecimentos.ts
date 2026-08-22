import { Component, computed, signal } from '@angular/core';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { EstabelecimentoItem } from './components/estabelecimento-item/estabelecimento-item';
import { ESTABELECIMENTOS_MOCK } from './mocks/mocks';
import { Estabelecimento, EstabelecimentoViewMode } from './types/types';

@Component({
  selector: 'app-estabelecimentos',
  imports: [
    Breadcrumb,
    EstabelecimentoItem
  ],
  templateUrl: './estabelecimentos.html',
  styleUrl: './estabelecimentos.scss',
})
export class Estabelecimentos {
  readonly listEsterabelecimentos = signal<Estabelecimento[]>(ESTABELECIMENTOS_MOCK);
  readonly viewMode = signal<EstabelecimentoViewMode>('list');
  readonly filterValue = signal('');
  readonly filteredEstabelecimentos = computed(() => {
    const normalizedFilter = this.normalizeValue(this.filterValue());

    if (!normalizedFilter) {
      return this.listEsterabelecimentos();
    }

    return this.listEsterabelecimentos().filter((estabelecimento) => {
      const searchableValues = [
        estabelecimento.nomeFantasia,
        estabelecimento.razaoSocial,
        estabelecimento.cnpj,
        this.formatEnumLabel(estabelecimento.status)
      ];

      return searchableValues.some((value) => this.normalizeValue(value).includes(normalizedFilter));
    });
  });

  setViewMode(mode: EstabelecimentoViewMode): void {
    this.viewMode.set(mode);
  }

  updateFilter(value: string): void {
    this.filterValue.set(value);
  }

  clearFilter(): void {
    this.filterValue.set('');
  }

  private formatEnumLabel(value: string): string {
    return value.replace(/_/g, ' ');
  }

  private normalizeValue(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
