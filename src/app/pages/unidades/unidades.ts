import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { ESTABELECIMENTOS_MOCK, UNIDADES_MOCK } from '../estabelecimentos/mocks/mocks';
import { Estabelecimento, EstabelecimentoViewMode, Unidade } from '../estabelecimentos/types/types';
import { UnidadeItem } from './components/unidade-item/unidade-item';

@Component({
  selector: 'app-detail',
  imports: [
    Breadcrumb,
    UnidadeItem,
  ],
  templateUrl: './unidades.html',
  styleUrl: './unidades.scss',
})
export class Unidades {
  private readonly route = inject(ActivatedRoute);
  private readonly estabelecimentoId = this.getRouteParam('estabelecimentoId');

  readonly estabelecimento = computed<Estabelecimento | null>(() => (
    ESTABELECIMENTOS_MOCK.find((item) => item.id === this.estabelecimentoId) ?? null
  ));
  readonly unidades = computed<Unidade[]>(() => (
    UNIDADES_MOCK.filter((item) => item.estabelecimentoId === this.estabelecimentoId)
  ));
  readonly viewMode = signal<EstabelecimentoViewMode>('list');
  readonly filterValue = signal('');
  readonly filteredUnidades = computed(() => {
    const normalizedFilter = this.normalizeValue(this.filterValue());

    if (!normalizedFilter) {
      return this.unidades();
    }

    return this.unidades().filter((unidade) => {
      const searchableValues = [
        unidade.nome,
        unidade.cnpj,
        unidade.email,
        unidade.telefone,
        this.formatEnumLabel(unidade.tipo),
        this.formatEnumLabel(unidade.status),
        unidade.endereco.logradouro,
        unidade.endereco.bairro,
        unidade.endereco.cidade,
        unidade.endereco.uf,
      ];

      return searchableValues.some((value) => this.normalizeValue(value).includes(normalizedFilter));
    });
  });
  readonly estabelecimentoInitials = computed(() => {
    const estabelecimento = this.estabelecimento();

    if (!estabelecimento) {
      return 'ND';
    }

    const [firstWord = '', secondWord = ''] = estabelecimento.nomeFantasia.trim().split(/\s+/);

    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
  });
  readonly formattedUnits = computed(() => {
    const total = this.unidades().length;
    return `${total} ${total === 1 ? 'unidade' : 'unidades'}`;
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

  private getRouteParam(paramName: string): string {
    for (const routeSnapshot of this.route.snapshot.pathFromRoot) {
      const value = routeSnapshot.paramMap.get(paramName);

      if (value) {
        return value;
      }
    }

    return '';
  }
}
