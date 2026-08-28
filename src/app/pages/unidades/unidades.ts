import {Component, computed, inject, OnInit, signal} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { ESTABELECIMENTOS_MOCK, UNIDADES_MOCK } from '../estabelecimentos/mocks/mocks';
import { Estabelecimento, EstabelecimentoViewMode, Unidade } from '../estabelecimentos/types/types';
import { UnidadeItem } from './components/unidade-item/unidade-item';
import {UnidadesService} from './unidades.service';

@Component({
  selector: 'app-detail',
  imports: [
    Breadcrumb,
    UnidadeItem,
    RouterLink,
  ],
  templateUrl: './unidades.html',
  styleUrl: './unidades.scss',
})
export class Unidades implements OnInit{
  private readonly route = inject(ActivatedRoute);
  private readonly idEstabelecimento = this.getRouteParam('idEstabelecimento');
  private readonly unidadesService = inject(UnidadesService);

  readonly estabelecimento = signal<Estabelecimento | null>(null);
  readonly viewMode = signal<EstabelecimentoViewMode>('list');
  readonly filterValue = signal('');
  readonly filteredUnidades = signal<Unidade[]>([]);
  readonly estabelecimentoInitials = computed(() => {
    const estabelecimento = this.estabelecimento();

    if (!estabelecimento) {
      return 'ND';
    }

    const [firstWord = '', secondWord = ''] = estabelecimento.nomeFantasia.trim().split(/\s+/);

    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
  });
  readonly formattedUnits = computed(() => {
    const total = this.filteredUnidades().length;
    return `${total} ${total === 1 ? 'unidade' : 'unidades'}`;
  });

  ngOnInit(): void {
    this.getUnidades(this.idEstabelecimento);
    this.getEstabelecimento(this.idEstabelecimento);
  }

  getUnidades(busca: string) {
    this.unidadesService.getUnidades(this.idEstabelecimento, busca).subscribe(res => {
      this.filteredUnidades.set(res);
    });
  }

  getEstabelecimento(idEstabelecimento: string) {
    this.unidadesService.getEstabelecimento(idEstabelecimento).subscribe(res => {
      this.estabelecimento.set(res);
    });
  }

  setViewMode(mode: EstabelecimentoViewMode): void {
    this.viewMode.set(mode);
  }

  updateFilter(value: string): void {
    this.getUnidades(value);
  }

  clearFilter(): void {
    this.filterValue.set('');
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
